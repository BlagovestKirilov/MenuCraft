import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVenues } from '../api/venueApi';
import { getErrorMessage } from '../utils/helpers';

export default function VenuesPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await getVenues();
        setVenues(data.venues || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const handleVenueClick = (venueName) => {
    navigate(`/venue/templates?venue=${encodeURIComponent(venueName)}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>{t('venues.title')}</h1>
            <p>{t('venues.subtitle')}</p>
          </div>
          {isAdmin && (
            <Link to="/venue/register" className="btn btn-primary btn-lg">
              {t('venues.registerNew')}
            </Link>
          )}
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {loading && <LoadingSpinner />}

      {!loading && venues.length === 0 && !error && (
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <p className="text-secondary" style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            {t('venues.noVenues')}
          </p>
          {isAdmin && (
            <Link to="/venue/register" className="btn btn-primary btn-lg">
              {t('venues.registerNew')}
            </Link>
          )}
        </div>
      )}

      {venues.length > 0 && (
        <div className="grid-2">
          {venues.map((v, i) => (
            <div
              key={i}
              className="card venue-card"
              onClick={() => handleVenueClick(v.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleVenueClick(v.name)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3>{v.name}</h3>
                <span className="badge badge-info" style={{ flexShrink: 0 }}>{t('venues.viewTemplates')}</span>
              </div>
              <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.9rem' }}>
                <div>
                  <span className="text-secondary">{t('venues.email')}:</span>{' '}
                  <span>{v.email}</span>
                </div>
                <div>
                  <span className="text-secondary">{t('venues.phone')}:</span>{' '}
                  <span>{v.phone}</span>
                </div>
                <div>
                  <span className="text-secondary">{t('venues.city')}:</span>{' '}
                  <span>{v.city}</span>
                </div>
                <div>
                  <span className="text-secondary">{t('venues.address')}:</span>{' '}
                  <span>{v.address}</span>
                </div>
                {v.description && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className="text-secondary">{t('venues.description')}:</span>{' '}
                    <span>{v.description}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
