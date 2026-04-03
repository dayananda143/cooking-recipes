function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      cuisine TEXT,
      prep_time INTEGER,
      cook_time INTEGER,
      servings INTEGER,
      difficulty TEXT DEFAULT 'medium',
      image_url TEXT,
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity TEXT,
      unit TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipe_tags (
      recipe_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (recipe_id, tag_id),
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      user_id INTEGER NOT NULL,
      recipe_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, recipe_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ingredient_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#f97316',
      description TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      abbreviation TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ingredient_category_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS step_ingredients (
      step_id INTEGER NOT NULL,
      ingredient_id INTEGER NOT NULL,
      PRIMARY KEY (step_id, ingredient_id),
      FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE,
      FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
    );
  `);

  // Additive migrations for existing databases
  try { db.exec(`ALTER TABLE ingredients ADD COLUMN category_id INTEGER REFERENCES ingredient_categories(id) ON DELETE SET NULL`); } catch {}
  try { db.exec(`ALTER TABLE ingredient_categories ADD COLUMN type_id INTEGER REFERENCES ingredient_category_types(id) ON DELETE SET NULL`); } catch {}

  // Seed default types if empty
  const typeCount = db.prepare('SELECT COUNT(*) as c FROM ingredient_category_types').get();
  if (typeCount.c === 0) {
    const stmt = db.prepare('INSERT INTO ingredient_category_types (name, sort_order) VALUES (?, ?)');
    stmt.run('Regular', 1);
    stmt.run('Spices', 2);
  }

  // Seed default units if empty
  const unitCount = db.prepare('SELECT COUNT(*) as c FROM units').get();
  if (unitCount.c === 0) {
    const defaults = [
      { name: 'count',      abbreviation: null   },
      { name: 'teaspoon',   abbreviation: 'tsp'  },
      { name: 'tablespoon', abbreviation: 'tbsp' },
      { name: 'cup',        abbreviation: 'cup'  },
      { name: 'ounce',      abbreviation: 'oz'   },
      { name: 'pound',      abbreviation: 'lb'   },
      { name: 'gram',       abbreviation: 'g'    },
      { name: 'kilogram',   abbreviation: 'kg'   },
      { name: 'milliliter', abbreviation: 'ml'   },
      { name: 'liter',      abbreviation: 'l'    },
    ];
    const stmt = db.prepare('INSERT INTO units (name, abbreviation, sort_order) VALUES (?, ?, ?)');
    defaults.forEach((u, i) => stmt.run(u.name, u.abbreviation, i + 1));
  }
}

module.exports = { runMigrations };
