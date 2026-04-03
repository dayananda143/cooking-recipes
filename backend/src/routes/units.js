const express = require('express');
const db = require('../db/database');
const router = express.Router();

// GET /api/units
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM units ORDER BY sort_order, name').all());
});

// POST /api/units
router.post('/', (req, res) => {
  const { name, abbreviation, sort_order } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const existing = db.prepare('SELECT id FROM units WHERE name = ?').get(name.trim());
  if (existing) return res.status(409).json({ error: 'Unit name already exists' });

  const maxOrder = db.prepare('SELECT MAX(sort_order) as m FROM units').get();
  const result = db.prepare('INSERT INTO units (name, abbreviation, sort_order) VALUES (?, ?, ?)')
    .run(name.trim(), abbreviation?.trim() || null, sort_order ?? (maxOrder.m ?? 0) + 1);

  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/units/:id
router.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM units WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Unit not found' });

  const { name, abbreviation, sort_order } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

  const conflict = db.prepare('SELECT id FROM units WHERE name = ? AND id != ?').get(name.trim(), row.id);
  if (conflict) return res.status(409).json({ error: 'Unit name already exists' });

  db.prepare('UPDATE units SET name=?, abbreviation=?, sort_order=? WHERE id=?')
    .run(name.trim(), abbreviation?.trim() || null, sort_order ?? row.sort_order, row.id);

  res.json({ success: true });
});

// DELETE /api/units/:id
router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM units WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Unit not found' });
  db.prepare('DELETE FROM units WHERE id = ?').run(row.id);
  res.json({ success: true });
});

module.exports = router;
