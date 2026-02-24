import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
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
              <NavLink to="/venue/templates">{t('nav.templates')}</NavLink>
              <NavLink to="/history">{t('nav.history')}</NavLink>
              {isAdmin && (
                <NavLink to="/admin/register">{t('nav.adminRegister')}</NavLink>
              )}
              <LanguageSwitcher />
              <button onClick={logout}>{t('common.logout')}</button>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <NavLink to="/auth/login">{t('nav.login')}</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
