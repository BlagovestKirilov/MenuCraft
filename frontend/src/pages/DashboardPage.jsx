import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();

  const CARDS = [
    {
      titleKey: 'dashboard.cards.venues.title',
      descKey: 'dashboard.cards.venues.description',
      link: '/venues',
      icon: '🏪',
    },
    {
      titleKey: 'dashboard.cards.templates.title',
      descKey: 'dashboard.cards.templates.description',
      link: '/venue/templates',
      icon: '📄',
    },
    {
      titleKey: 'dashboard.cards.menu.title',
      descKey: 'dashboard.cards.menu.description',
      link: '/menu/generate',
      icon: '🍽️',
    },
    {
      titleKey: 'dashboard.cards.facebook.title',
      descKey: 'dashboard.cards.facebook.description',
      link: '/facebook',
      icon: '📘',
    },
  ];

  const ADMIN_CARDS = [
    {
      titleKey: 'dashboard.adminCards.addTemplate.title',
      descKey: 'dashboard.adminCards.addTemplate.description',
      link: '/admin/template',
      icon: '⬆️',
    },
    {
      titleKey: 'dashboard.adminCards.browseTemplates.title',
      descKey: 'dashboard.adminCards.browseTemplates.description',
      link: '/admin/templates',
      icon: '📋',
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid-2">
        {CARDS.map((c) => (
          <Link key={c.link} to={c.link} style={{ textDecoration: 'none' }}>
            <div className="card card-compact" style={{ cursor: 'pointer', transition: 'var(--transition)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <h3 style={{ marginBottom: '0.25rem' }}>{t(c.titleKey)}</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                {t(c.descKey)}
              </p>
            </div>
          </Link>
        ))}

        {isAdmin &&
          ADMIN_CARDS.map((c) => (
            <Link key={c.link} to={c.link} style={{ textDecoration: 'none' }}>
              <div
                className="card card-compact"
                style={{
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  borderLeft: '4px solid var(--color-primary)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
                <h3 style={{ marginBottom: '0.25rem' }}>{t(c.titleKey)}</h3>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  {t(c.descKey)}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
