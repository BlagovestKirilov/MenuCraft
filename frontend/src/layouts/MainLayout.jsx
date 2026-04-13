import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <Link to="/privacy">{t('footer.privacy')}</Link>
        <span className="footer-sep">·</span>
        <Link to="/terms">{t('footer.terms')}</Link>
      </footer>
    </div>
  );
}
