import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, role } = useAuth();
  const { t } = useTranslation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          MenuCraft
        </NavLink>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">{t('nav.dashboard')}</NavLink>
              <NavLink to="/venues">{t('nav.venues')}</NavLink>
              {isAdmin && (
                <>
                  <NavLink to="/venue/templates">{t('nav.templates')}</NavLink>
                  <NavLink to="/menu/generate">{t('nav.menu')}</NavLink>
                </>
              )}
              {isAdmin && <NavLink to="/admin/template">{t('nav.admin')}</NavLink>}
              <span className="text-secondary" style={{ fontSize: '0.8rem', padding: '0 0.5rem' }}>
                {role}
              </span>
              <LanguageSwitcher />
              <button onClick={logout}>{t('common.logout')}</button>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <NavLink to="/auth/login">{t('nav.login')}</NavLink>
              <NavLink to="/auth/register">{t('nav.register')}</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
