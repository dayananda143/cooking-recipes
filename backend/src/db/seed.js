const bcrypt = require('bcryptjs');

async function seedAdmin(db) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existing) {
    const hash = await bcrypt.hash('changeme', 10);
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    console.log('Admin user created: admin / changeme');
  }
}

module.exports = { seedAdmin };
