import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  // Close menu on route change
  const handleNavClick = () => closeMenu();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={handleNavClick}>
          MenuCraft
        </NavLink>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>

        <div className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" onClick={handleNavClick}>{t('nav.dashboard')}</NavLink>
              <NavLink to="/venues" onClick={handleNavClick}>{t('nav.venues')}</NavLink>
              {isAdmin && (
                <NavLink to="/venue/templates" onClick={handleNavClick}>{t('nav.templates')}</NavLink>
              )}
              <NavLink to="/history" onClick={handleNavClick}>{t('nav.history')}</NavLink>
              {isAdmin && (
                <NavLink to="/admin/register" onClick={handleNavClick}>{t('nav.adminRegister')}</NavLink>
              )}
              <LanguageSwitcher />
              <button onClick={() => { logout(); closeMenu(); }}>{t('common.logout')}</button>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <NavLink to="/auth/login" onClick={handleNavClick}>{t('nav.login')}</NavLink>
            </>
          )}
        </div>
      </div>

      {menuOpen && <div className="navbar-backdrop" onClick={closeMenu} />}
    </nav>
  );
}
