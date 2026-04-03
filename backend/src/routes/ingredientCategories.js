const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT ic.*, t.name as type_name, COUNT(i.id) as ingredient_count
    FROM ingredient_categories ic
    LEFT JOIN ingredient_category_types t ON ic.type_id = t.id
    LEFT JOIN ingredients i ON i.category_id = ic.id
    GROUP BY ic.id
    ORDER BY ic.sort_order, ic.name
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ingredient_categories WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Category not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, color, description, sort_order, type_id } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const existing = db.prepare('SELECT id FROM ingredient_categories WHERE name = ?').get(name.trim());
  if (existing) return res.status(409).json({ error: 'Category name already exists' });
  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM ingredient_categories').get();
  const result = db.prepare(
    'INSERT INTO ingredient_categories (name, color, description, sort_order, type_id) VALUES (?, ?, ?, ?, ?)'
  ).run(name.trim(), color || '#f97316', description || null, sort_order ?? (maxOrder.m ?? 0) + 1, type_id || null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ingredient_categories WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Category not found' });
  const { name, color, description, sort_order, type_id } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const conflict = db.prepare('SELECT id FROM ingredient_categories WHERE name = ? AND id != ?').get(name.trim(), row.id);
  if (conflict) return res.status(409).json({ error: 'Category name already exists' });
  db.prepare(
    'UPDATE ingredient_categories SET name=?, color=?, description=?, sort_order=?, type_id=? WHERE id=?'
  ).run(name.trim(), color || '#f97316', description || null, sort_order ?? row.sort_order, type_id || null, row.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ingredient_categories WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Category not found' });
  db.prepare('UPDATE ingredients SET category_id = NULL WHERE category_id = ?').run(row.id);
  db.prepare('DELETE FROM ingredient_categories WHERE id = ?').run(row.id);
  res.json({ success: true });
});

module.exports = router;
