import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RecipeFormPage from './pages/RecipeFormPage';
import FavoritesPage from './pages/FavoritesPage';
import IngredientCategoriesPage from './pages/IngredientCategoriesPage';
import IngredientCategoryTypesPage from './pages/IngredientCategoryTypesPage';
import UnitsPage from './pages/UnitsPage';

function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function GuestRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/recipes" replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/recipes" replace />} />
                <Route path="/recipes" element={<RecipesPage />} />
                <Route path="/recipes/new" element={<RecipeFormPage />} />
                <Route path="/recipes/:id" element={<RecipeDetailPage />} />
                <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/ingredient-categories" element={<IngredientCategoriesPage />} />
                <Route path="/ingredient-category-types" element={<IngredientCategoryTypesPage />} />
                <Route path="/units" element={<UnitsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/recipes" replace />} />
          </Routes>
        </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
