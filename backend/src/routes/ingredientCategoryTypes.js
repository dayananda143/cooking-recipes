const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM ingredient_category_types ORDER BY sort_order, name').all());
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const existing = db.prepare('SELECT id FROM ingredient_category_types WHERE name = ?').get(name.trim());
  if (existing) return res.status(409).json({ error: 'Type already exists' });
  const max = db.prepare('SELECT MAX(sort_order) as m FROM ingredient_category_types').get();
  const result = db.prepare('INSERT INTO ingredient_category_types (name, sort_order) VALUES (?, ?)').run(name.trim(), (max.m ?? 0) + 1);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ingredient_category_types WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Type not found' });
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const conflict = db.prepare('SELECT id FROM ingredient_category_types WHERE name = ? AND id != ?').get(name.trim(), row.id);
  if (conflict) return res.status(409).json({ error: 'Type already exists' });
  db.prepare('UPDATE ingredient_category_types SET name = ? WHERE id = ?').run(name.trim(), row.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM ingredient_category_types WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Type not found' });
  db.prepare('UPDATE ingredient_categories SET type_id = NULL WHERE type_id = ?').run(row.id);
  db.prepare('DELETE FROM ingredient_category_types WHERE id = ?').run(row.id);
  res.json({ success: true });
});

module.exports = router;
