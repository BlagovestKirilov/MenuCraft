import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const CARDS = [
  {
    title: 'Register Venue',
    description: 'Create a new venue and link it to accounts.',
    link: '/venue/register',
    icon: '🏪',
  },
  {
    title: 'View Templates',
    description: 'Browse templates assigned to your venues.',
    link: '/venue/templates',
    icon: '📄',
  },
  {
    title: 'Generate Menu',
    description: 'Create a PDF menu from a template and meals.',
    link: '/menu/generate',
    icon: '🍽️',
  },
  {
    title: 'Facebook Integration',
    description: 'Connect pages and post to Facebook.',
    link: '/facebook',
    icon: '📘',
  },
];

const ADMIN_CARDS = [
  {
    title: 'Add Template',
    description: 'Upload a new PDF template with sections.',
    link: '/admin/template',
    icon: '⬆️',
  },
  {
    title: 'Browse Templates',
    description: 'View and download uploaded templates.',
    link: '/admin/templates',
    icon: '📋',
  },
];

export default function DashboardPage() {
  const { isAdmin, role } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to MenuCraft. Choose an action below.</p>
      </div>

      <div className="grid-2">
        {CARDS.map((c) => (
          <Link key={c.link} to={c.link} style={{ textDecoration: 'none' }}>
            <div className="card card-compact" style={{ cursor: 'pointer', transition: 'var(--transition)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <h3 style={{ marginBottom: '0.25rem' }}>{c.title}</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                {c.description}
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
                <h3 style={{ marginBottom: '0.25rem' }}>{c.title}</h3>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
