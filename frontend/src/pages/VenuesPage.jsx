import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getVenues } from '../api/venueApi';
import { getOAuthLoginUrl, disconnectFacebook } from '../api/facebookApi';
import { getErrorMessage } from '../utils/helpers';

export default function VenuesPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const didFetch = useRef(false);

  // Disconnect confirmation modal state
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

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

  const openDisconnectModal = (e, venueIndex, connectionId, pageName) => {
    e.stopPropagation();
    setDisconnectTarget({ venueIndex, connectionId, pageName });
  };

  const closeDisconnectModal = () => {
    setDisconnectTarget(null);
    setDisconnecting(false);
  };

  const confirmDisconnect = async () => {
    if (!disconnectTarget) return;
    setDisconnecting(true);
    try {
      await disconnectFacebook(disconnectTarget.connectionId);
      setVenues((prev) => {
        const copy = [...prev];
        const venue = { ...copy[disconnectTarget.venueIndex] };
        venue.facebookConnections = venue.facebookConnections.map((c) =>
          c.id === disconnectTarget.connectionId ? { ...c, status: 'DISCONNECTED' } : c
        );
        copy[disconnectTarget.venueIndex] = venue;
        return copy;
      });
      closeDisconnectModal();
    } catch (err) {
      setError(getErrorMessage(err));
      closeDisconnectModal();
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
            const hasActiveConnection = conns.some((c) => c.status === 'CONNECTED');
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
                    <div>
                      <span className="text-secondary">{t('venues.description')}:</span>{' '}<span>{v.description}</span>
                    </div>
                  )}
                </div>

                {/* Facebook section */}
                <div className="fb-section">
                  <div className="fb-section-header">
                    <div className="fb-section-label">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877f2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
                    </div>
                    {!hasActiveConnection && (
                      <button
                        className="btn btn-facebook btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        onClick={(e) => handleConnectFacebook(e, v.name)}
                      >
                        {t('venues.connectFacebook')}
                      </button>
                    )}
                  </div>

                  {conns.length === 0 && (
                    <div className="fb-empty">
                      <span>{t('venues.noFacebookConnections')}</span>
                    </div>
                  )}

                  {conns.map((c) => {
                    const isConnected = c.status === 'CONNECTED';
                    return (
                      <div key={c.id} className={`fb-connection-item ${isConnected ? 'fb-connected' : 'fb-disconnected'}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                          <div className={`fb-status-dot ${isConnected ? 'dot-connected' : 'dot-disconnected'}`} />
                          <span className="fb-page-name">{c.pageName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          {isConnected ? (
                            <>
                              <button
                                className="fb-action-link fb-post-link"
                                onClick={(e) => handlePost(e, c.id)}
                              >
                                {t('facebook.postButton')}
                              </button>
                              <span style={{ color: 'var(--color-border)' }}>|</span>
                              <button
                                className="fb-action-link fb-disconnect-link"
                                onClick={(e) => openDisconnectModal(e, i, c.id, c.pageName)}
                              >
                                {t('venues.disconnectFacebook')}
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                              {t('venues.fbDisconnected')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disconnect confirmation modal */}
      {disconnectTarget && (
        <div className="confirm-modal-overlay" onClick={closeDisconnectModal}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('venues.disconnectFacebook')}</h3>
            <p>{t('venues.disconnectConfirm')}</p>
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginTop: '-0.75rem' }}>
              {disconnectTarget.pageName}
            </p>
            <div className="confirm-modal-actions">
              <button className="btn btn-secondary" onClick={closeDisconnectModal} disabled={disconnecting}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-danger" onClick={confirmDisconnect} disabled={disconnecting}>
                {disconnecting ? '...' : t('venues.disconnectFacebook')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
