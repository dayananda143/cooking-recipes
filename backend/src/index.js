require('dotenv').config();
const express = require('express');
const cors = require('cors');

const db = require('./db/database');
const authRouter = require('./routes/auth');
const recipesRouter = require('./routes/recipes');
const ingredientCategoriesRouter = require('./routes/ingredientCategories');
const ingredientCategoryTypesRouter = require('./routes/ingredientCategoryTypes');
const unitsRouter = require('./routes/units');
const errorHandler = require('./middleware/errorHandler');
const requireAuth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors({
  origin: [
    'http://localhost:5175',
    'https://cooking-recipes.money-matriz.co.in',
  ]
}));
app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use(requireAuth);
app.use('/api/recipes', recipesRouter);
app.use('/api/ingredient-categories', ingredientCategoriesRouter);
app.use('/api/ingredient-category-types', ingredientCategoryTypesRouter);
app.use('/api/units', unitsRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Cooking Recipes backend running on port ${PORT}`));
