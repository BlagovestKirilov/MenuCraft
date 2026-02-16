import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVenues } from '../api/venueApi';
import { getOAuthLoginUrl } from '../api/facebookApi';
import { getErrorMessage } from '../utils/helpers';

export default function VenuesPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchData = async () => {
      try {
        const data = await getVenues();
        setVenues(data.venues || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVenueClick = (venueName) => {
    navigate(`/venue/templates?venue=${encodeURIComponent(venueName)}`);
  };

  const handleConnectFacebook = async (e, venueName) => {
    e.stopPropagation();
    try {
      const url = await getOAuthLoginUrl(venueName);
      window.location.href = url;
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handlePost = (e, connectionId) => {
    e.stopPropagation();
    navigate(`/facebook/post/${connectionId}`);
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
            {isAdmin ? t('venues.noVenues') : t('venues.noVenuesUser')}
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
          {venues.map((v, i) => {
            const conns = v.facebookConnections || [];
            return (
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
                    <span className="text-secondary">{t('venues.email')}:</span>{' '}<span>{v.email}</span>
                  </div>
                  <div>
                    <span className="text-secondary">{t('venues.phone')}:</span>{' '}<span>{v.phone}</span>
                  </div>
                  <div>
                    <span className="text-secondary">{t('venues.city')}:</span>{' '}<span>{v.city}</span>
                  </div>
                  <div>
                    <span className="text-secondary">{t('venues.address')}:</span>{' '}<span>{v.address}</span>
                  </div>
                  {v.description && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className="text-secondary">{t('venues.description')}:</span>{' '}<span>{v.description}</span>
                    </div>
                  )}
                </div>

                {/* Facebook connections section */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t('venues.facebookConnections')}</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => handleConnectFacebook(e, v.name)}
                    >
                      {t('venues.connectFacebook')}
                    </button>
                  </div>
                  {conns.length === 0 && (
                    <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{t('venues.noFacebookConnections')}</p>
                  )}
                  {conns.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {conns.map((c) => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 500 }}>{c.pageName}</span>
                            <span className={`badge ${c.status === 'CONNECTED' ? 'badge-success' : 'badge-danger'}`}
                              style={{ fontSize: '0.7rem' }}>
                              {c.status}
                            </span>
                          </div>
                          {c.status === 'CONNECTED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={(e) => handlePost(e, c.id)}
                            >
                              {t('facebook.postButton')}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
