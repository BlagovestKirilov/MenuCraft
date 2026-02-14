import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PrivateRoute from './PrivateRoute';

// Auth pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Public / Venue pages
import DashboardPage from '../pages/DashboardPage';
import VenueRegisterPage from '../pages/VenueRegisterPage';
import VenueTemplatesPage from '../pages/VenueTemplatesPage';
import MenuGeneratorPage from '../pages/MenuGeneratorPage';

// Admin pages
import AdminTemplatePage from '../pages/AdminTemplatePage';
import AdminTemplateListPage from '../pages/AdminTemplateListPage';

// Facebook pages
import FacebookPage from '../pages/FacebookPage';
import FacebookCallbackPage from '../pages/FacebookCallbackPage';
import FacebookPostPage from '../pages/FacebookPostPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth pages — no navbar */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Facebook OAuth callback (public) */}
      <Route path="/facebook/oauth/callback" element={<FacebookCallbackPage />} />

      {/* Main layout with navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Venue */}
        <Route
          path="/venue/register"
          element={
            <PrivateRoute>
              <VenueRegisterPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/venue/templates"
          element={
            <PrivateRoute>
              <VenueTemplatesPage />
            </PrivateRoute>
          }
        />

        {/* Menu */}
        <Route
          path="/menu/generate"
          element={
            <PrivateRoute>
              <MenuGeneratorPage />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/template"
          element={
            <PrivateRoute>
              <AdminTemplatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/templates"
          element={
            <PrivateRoute>
              <AdminTemplateListPage />
            </PrivateRoute>
          }
        />

        {/* Facebook */}
        <Route
          path="/facebook"
          element={
            <PrivateRoute>
              <FacebookPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/facebook/post/:connectionId"
          element={
            <PrivateRoute>
              <FacebookPostPage />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
