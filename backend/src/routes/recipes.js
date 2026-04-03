const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET /api/recipes — list user's recipes + public ones
router.get('/', (req, res) => {
  const { search, category, cuisine, difficulty } = req.query;
  let query = `
    SELECT r.*, u.username as author,
      (SELECT COUNT(*) FROM favorites f WHERE f.recipe_id = r.id) as favorite_count,
      (SELECT 1 FROM favorites f2 WHERE f2.recipe_id = r.id AND f2.user_id = ?) as is_favorited
    FROM recipes r
    JOIN users u ON r.user_id = u.id
    WHERE (r.user_id = ? OR r.is_public = 1)
  `;
  const params = [req.user.id, req.user.id];

  if (search) { query += ` AND (r.title LIKE ? OR r.description LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  if (category) { query += ` AND r.category = ?`; params.push(category); }
  if (cuisine) { query += ` AND r.cuisine = ?`; params.push(cuisine); }
  if (difficulty) { query += ` AND r.difficulty = ?`; params.push(difficulty); }

  query += ` ORDER BY r.created_at DESC`;
  res.json(db.prepare(query).all(...params));
});

// GET /api/recipes/:id
router.get('/:id', (req, res) => {
  const recipe = db.prepare(`
    SELECT r.*, u.username as author,
      (SELECT COUNT(*) FROM favorites f WHERE f.recipe_id = r.id) as favorite_count,
      (SELECT 1 FROM favorites f2 WHERE f2.recipe_id = r.id AND f2.user_id = ?) as is_favorited
    FROM recipes r JOIN users u ON r.user_id = u.id
    WHERE r.id = ? AND (r.user_id = ? OR r.is_public = 1)
  `).get(req.user.id, req.params.id, req.user.id);

  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  recipe.ingredients = db.prepare(`
    SELECT i.*, ic.name as category_name, ic.color as category_color
    FROM ingredients i
    LEFT JOIN ingredient_categories ic ON i.category_id = ic.id
    WHERE i.recipe_id = ? ORDER BY i.sort_order
  `).all(recipe.id);

  const rawSteps = db.prepare('SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_number').all(recipe.id);
  const siStmt = db.prepare('SELECT ingredient_id FROM step_ingredients WHERE step_id = ?');
  recipe.steps = rawSteps.map(s => ({
    ...s,
    ingredientIds: siStmt.all(s.id).map(r => r.ingredient_id),
  }));

  recipe.tags = db.prepare(`
    SELECT t.name FROM tags t JOIN recipe_tags rt ON t.id = rt.tag_id WHERE rt.recipe_id = ?
  `).all(recipe.id).map(t => t.name);

  res.json(recipe);
});

// POST /api/recipes
router.post('/', (req, res) => {
  const { title, description, category, cuisine, prep_time, cook_time, servings, difficulty, image_url, is_public, ingredients, steps, tags } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  db.exec('BEGIN');
  try {
    const result = db.prepare(`
      INSERT INTO recipes (user_id, title, description, category, cuisine, prep_time, cook_time, servings, difficulty, image_url, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, title, description ?? null, category ?? null, cuisine ?? null, prep_time ?? null, cook_time ?? null, servings ?? null, difficulty || 'medium', image_url ?? null, is_public ? 1 : 0);

    const recipeId = result.lastInsertRowid;
    const ingIdMap = _saveIngredients(recipeId, ingredients);
    const stepIdMap = _saveSteps(recipeId, steps);
    _saveStepIngredients(stepIdMap, ingIdMap, steps);
    _saveTags(recipeId, tags);
    db.exec('COMMIT');
    res.status(201).json({ id: recipeId });
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
});

// PUT /api/recipes/:id
router.put('/:id', (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  const { title, description, category, cuisine, prep_time, cook_time, servings, difficulty, image_url, is_public, ingredients, steps, tags } = req.body;

  db.exec('BEGIN');
  try {
    db.prepare(`
      UPDATE recipes SET title=?, description=?, category=?, cuisine=?, prep_time=?, cook_time=?,
        servings=?, difficulty=?, image_url=?, is_public=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(title, description ?? null, category ?? null, cuisine ?? null, prep_time ?? null, cook_time ?? null, servings ?? null, difficulty ?? null, image_url ?? null, is_public ? 1 : 0, recipe.id);

    db.prepare('DELETE FROM ingredients WHERE recipe_id = ?').run(recipe.id);
    db.prepare('DELETE FROM steps WHERE recipe_id = ?').run(recipe.id);
    db.prepare('DELETE FROM recipe_tags WHERE recipe_id = ?').run(recipe.id);

    const ingIdMap = _saveIngredients(recipe.id, ingredients);
    const stepIdMap = _saveSteps(recipe.id, steps);
    _saveStepIngredients(stepIdMap, ingIdMap, steps);
    _saveTags(recipe.id, tags);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  res.json({ success: true });
});

// DELETE /api/recipes/:id
router.delete('/:id', (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  db.prepare('DELETE FROM recipes WHERE id = ?').run(recipe.id);
  res.json({ success: true });
});

// POST /api/recipes/:id/favorite
router.post('/:id/favorite', (req, res) => {
  const existing = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND recipe_id = ?').get(req.user.id, req.params.id);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?').run(req.user.id, req.params.id);
    res.json({ favorited: false });
  } else {
    db.prepare('INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.json({ favorited: true });
  }
});

// Returns { sort_order -> id } map
function _saveIngredients(recipeId, ingredients) {
  if (!Array.isArray(ingredients)) return {};
  const stmt = db.prepare('INSERT INTO ingredients (recipe_id, name, quantity, unit, sort_order, category_id) VALUES (?, ?, ?, ?, ?, ?)');
  const idMap = {};
  ingredients.forEach((ing, i) => {
    const qty = ing.quantity != null && ing.quantity !== '' ? String(ing.quantity) : null;
    const unit = ing.unit != null && ing.unit !== '' ? String(ing.unit) : null;
    const catId = ing.category_id != null && ing.category_id !== '' ? Number(ing.category_id) : null;
    const r = stmt.run(recipeId, String(ing.name), qty, unit, i, catId);
    idMap[i] = r.lastInsertRowid;
  });
  return idMap;
}

// Returns { step_number -> id } map
function _saveSteps(recipeId, steps) {
  if (!Array.isArray(steps)) return {};
  const stmt = db.prepare('INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)');
  const idMap = {};
  steps.forEach((s, i) => {
    const instruction = typeof s === 'string' ? s : s.instruction;
    const r = stmt.run(recipeId, i + 1, instruction ?? null);
    idMap[i + 1] = r.lastInsertRowid;
  });
  return idMap;
}

function _saveStepIngredients(stepIdMap, ingIdMap, steps) {
  if (!Array.isArray(steps)) return;
  const stmt = db.prepare('INSERT OR IGNORE INTO step_ingredients (step_id, ingredient_id) VALUES (?, ?)');
  steps.forEach((s, i) => {
    const stepId = stepIdMap[i + 1];
    if (!stepId) return;
    const indices = typeof s === 'object' ? (s.ingredientIndices || []) : [];
    indices.forEach(ingIdx => {
      const ingId = ingIdMap[ingIdx];
      if (ingId) stmt.run(stepId, ingId);
    });
  });
}

function _saveTags(recipeId, tags) {
  if (!Array.isArray(tags)) return;
  tags.forEach(name => {
    if (!name) return;
    let tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(name.trim().toLowerCase());
    if (!tag) {
      const r = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name.trim().toLowerCase());
      tag = { id: r.lastInsertRowid };
    }
    try { db.prepare('INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)').run(recipeId, tag.id); } catch {}
  });
}

module.exports = router;
