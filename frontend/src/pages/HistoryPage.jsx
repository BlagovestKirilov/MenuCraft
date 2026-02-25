import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getHistory, getMenuDetail, getVenues } from '../api/venueApi';
import { postToFacebook } from '../api/facebookApi';
import { getErrorMessage, downloadBase64 } from '../utils/helpers';

export default function HistoryPage() {
  const { t } = useTranslation();
  const didFetch = useRef(false);

  const [allMenus, setAllMenus] = useState([]);
  const [menus, setMenus] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Preview modal
  const [detailLoading, setDetailLoading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewName, setPreviewName] = useState('');
  const [previewVenueName, setPreviewVenueName] = useState('');

  // Facebook connections (all active across all venues)
  const [activeConnections, setActiveConnections] = useState([]);

  // Facebook post form
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  const formatDateTime = (value) => {
    const date = new Date(value);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const fetchData = async () => {
      try {
        const [historyData, venuesData] = await Promise.all([getHistory(), getVenues()]);
        const menuList = historyData.menus || [];
        setAllMenus(menuList);
        setMenus(menuList);

        const venueList = venuesData.venues || [];
        setVenues(venueList);

        const conns = [];
        for (const v of venueList) {
          for (const c of v.facebookConnections || []) {
            if (c.status === 'CONNECTED') {
              conns.push({ ...c, venueName: v.name });
            }
          }
        }
        setActiveConnections(conns);
        if (conns.length > 0) setSelectedConnection(conns[0].id);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVenueFilter = (e) => {
    const venue = e.target.value;
    setSelectedVenue(venue);
    if (!venue) {
      setMenus(allMenus);
    } else {
      setMenus(allMenus.filter((m) => m.venueName === venue));
    }
  };

  const handleMenuClick = async (menu) => {
    setDetailLoading(true);
    setPostSuccess('');
    try {
      const detail = await getMenuDetail(menu.id);
      setPreviewPdf(detail.data);
      setPreviewImage(detail.previewImage || null);
      setPreviewName(menu.templateName);
      setPreviewVenueName(menu.venueName || '');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewPdf) {
      downloadBase64(previewPdf, 'application/pdf', `${previewName || 'menu'}.pdf`);
    }
  };

  const closePreview = () => {
    setPreviewPdf(null);
    setPreviewImage(null);
    setPreviewName('');
    setPreviewVenueName('');
    setShowPostForm(false);
    setPostMessage('');
    setPostError('');
    setPostSuccess('');
  };

  const handlePostToFacebook = async (e) => {
    e.preventDefault();
    if (!selectedConnection || !postMessage.trim()) return;
    setPostError('');
    setPostSuccess('');
    setPostLoading(true);
    try {
      const payload = {
        connectionId: selectedConnection,
        message: postMessage.trim(),
      };
      if (previewImage) {
        payload.base64Photo = previewImage;
      }
      const res = await postToFacebook(payload);
      if (res.status === 'ERROR') {
        setPostError(res.message);
      } else {
        setPostSuccess(t('menuGenerator.postSuccess', { postId: res.postId }));
        setShowPostForm(false);
        setPostMessage('');
      }
    } catch (err) {
      setPostError(getErrorMessage(err));
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('history.title')}</h1>
        <p>{t('history.subtitle')}</p>
      </div>

      {!loading && venues.length > 0 && (
        <div className="card" style={{ maxWidth: 800, marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t('history.filterByVenue')}</label>
            <select className="form-control" value={selectedVenue} onChange={handleVenueFilter}>
              <option value="">{t('history.allVenues')}</option>
              {venues.map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <ErrorAlert message={error} onClose={() => setError('')} />

      {loading && <LoadingSpinner />}

      {!loading && menus.length === 0 && !error && (
        <div className="card text-center" style={{ padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p className="text-secondary" style={{ fontSize: '1.1rem' }}>
            {t('history.noMenus')}
          </p>
        </div>
      )}

      {menus.length > 0 && (
        <div className="card" style={{ maxWidth: 800 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t('history.venueName')}</th>
                  <th>{t('history.templateName')}</th>
                  <th>{t('history.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((m) => (
                  <tr
                    key={m.id}
                    className="clickable-row"
                    onClick={() => handleMenuClick(m)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleMenuClick(m)}
                  >
                    <td>{m.venueName}</td>
                    <td>{m.templateName}</td>
                    <td>{formatDateTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="modal-overlay">
          <LoadingSpinner />
        </div>
      )}

      {/* ── PDF Preview Modal ── */}
      {previewPdf && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 960 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{previewName}</h3>
              <button className="btn btn-secondary btn-sm" onClick={closePreview}>&times;</button>
            </div>

            <iframe
              src={`data:application/pdf;base64,${previewPdf}`}
              title="Menu Preview"
              style={{ width: '100%', height: '60vh', border: 'none', borderRadius: 'var(--radius)', marginBottom: '1rem' }}
            />

            {(() => {
              const venueConns = activeConnections.filter((c) => c.venueName === previewVenueName);
              return (
                <>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={handleDownload}>
                      {t('common.download')}
                    </button>
                    {venueConns.length > 0 && !showPostForm && (
                      <button className="btn btn-facebook" onClick={() => {
                        setSelectedConnection(venueConns[0].id);
                        setShowPostForm(true);
                      }}>
                        {t('menuGenerator.postToFacebook')}
                      </button>
                    )}
                  </div>

                  {postSuccess && (
                    <div className="alert alert-success" style={{ marginTop: '1rem' }}>
                      {postSuccess}
                    </div>
                  )}

                  {showPostForm && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                      <h4 style={{ marginBottom: '0.75rem' }}>{t('menuGenerator.postToFacebook')}</h4>

                      {postError && <ErrorAlert message={postError} onClose={() => setPostError('')} />}

                      <form onSubmit={handlePostToFacebook}>
                        {venueConns.length > 1 && (
                          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                            <label>{t('menuGenerator.selectPage')}</label>
                            <select
                              className="form-control"
                              value={selectedConnection}
                              onChange={(e) => setSelectedConnection(e.target.value)}
                            >
                              {venueConns.map((c) => (
                                <option key={c.id} value={c.id}>{c.pageName}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {venueConns.length === 1 && (
                          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                            {t('menuGenerator.postingTo')}: <strong>{venueConns[0].pageName}</strong>
                          </p>
                        )}

                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                          <label>{t('menuGenerator.postMessageLabel')}</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={postMessage}
                            onChange={(e) => setPostMessage(e.target.value)}
                            placeholder={t('menuGenerator.postMessagePlaceholder')}
                            required
                          />
                        </div>

                        {previewImage && (
                          <p className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                            {t('menuGenerator.imageAttached')}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="submit" className="btn btn-facebook" disabled={postLoading}>
                            {postLoading ? t('menuGenerator.posting') : t('menuGenerator.publishPost')}
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setShowPostForm(false)}>
                            {t('common.cancel')}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
