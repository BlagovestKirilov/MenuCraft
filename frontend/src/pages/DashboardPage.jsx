import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { t } = useTranslation();

  const COMMON_CARDS = [
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
      titleKey: 'dashboard.cards.history.title',
      descKey: 'dashboard.cards.history.description',
      link: '/history',
      icon: '📋',
    },
  ];

  const ADMIN_CARDS = [
    {
      titleKey: 'dashboard.adminCards.registerAccount.title',
      descKey: 'dashboard.adminCards.registerAccount.description',
      link: '/admin/register',
      icon: '👤',
    },
  ];

  const allCards = [...COMMON_CARDS, ...(isAdmin ? ADMIN_CARDS : [])];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('dashboard.title')}</h1>
        <p>{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'stretch' }}>
        {allCards.map((c) => (
          <Link key={c.link} to={c.link} style={{ textDecoration: 'none', display: 'flex' }}>
            <div
              className="card card-compact"
              style={{
                cursor: 'pointer',
                transition: 'var(--transition)',
                borderLeft: '4px solid var(--color-primary)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <h3 style={{ marginBottom: '0.25rem' }}>{t(c.titleKey)}</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', flex: 1 }}>
                {t(c.descKey)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
