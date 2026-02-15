import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getOAuthLoginUrl, getConnections } from '../api/facebookApi';
import { getErrorMessage } from '../utils/helpers';

export default function FacebookPage() {
  const { t } = useTranslation();

  // ── Connect Section ──
  const [venueIdConnect, setVenueIdConnect] = useState('');
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState('');

  // ── Connections Section ──
  const [venueIdList, setVenueIdList] = useState('');
  const [connections, setConnections] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!venueIdConnect.trim()) return;
    setConnectError('');
    setConnectLoading(true);
    try {
      const url = await getOAuthLoginUrl(venueIdConnect.trim());
      window.location.href = url;
    } catch (err) {
      setConnectError(getErrorMessage(err));
      setConnectLoading(false);
    }
  };

  const handleLoadConnections = async (e) => {
    e.preventDefault();
    if (!venueIdList.trim()) return;
    setListError('');
    setListLoading(true);
    setSearched(true);
    try {
      const data = await getConnections(venueIdList.trim());
      setConnections(data);
    } catch (err) {
      setListError(getErrorMessage(err));
      setConnections([]);
    } finally {
      setListLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('facebook.title')}</h1>
        <p>{t('facebook.subtitle')}</p>
      </div>

      <div className="grid-2">
        {/* Connect Facebook */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>{t('facebook.connectTitle')}</h3>
          <ErrorAlert message={connectError} onClose={() => setConnectError('')} />
          <form onSubmit={handleConnect}>
            <FormField
              label={t('facebook.venueId')}
              name="venueIdConnect"
              value={venueIdConnect}
              onChange={(_, v) => setVenueIdConnect(v)}
              placeholder={t('facebook.venueIdPlaceholder')}
              required
            />
            <button type="submit" className="btn btn-primary btn-block" disabled={connectLoading}>
              {connectLoading ? t('facebook.connecting') : t('facebook.connectButton')}
            </button>
          </form>
        </div>

        {/* List Connections */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>{t('facebook.connectionsTitle')}</h3>
          <ErrorAlert message={listError} onClose={() => setListError('')} />
          <form onSubmit={handleLoadConnections} className="flex gap-1 items-center mb-2">
            <div style={{ flex: 1 }}>
              <FormField
                name="venueIdList"
                value={venueIdList}
                onChange={(_, v) => setVenueIdList(v)}
                placeholder={t('facebook.venueIdPlaceholder')}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={listLoading}>
              {t('facebook.loadButton')}
            </button>
          </form>

          {listLoading && <LoadingSpinner />}

          {!listLoading && searched && connections.length === 0 && !listError && (
            <p className="text-secondary text-center">{t('facebook.noConnections')}</p>
          )}

          {connections.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{t('facebook.page')}</th>
                    <th>{t('facebook.status')}</th>
                    <th>{t('facebook.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.pageName}</strong>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {c.pageId}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'CONNECTED' ? 'badge-success' : 'badge-danger'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        {c.status === 'CONNECTED' && (
                          <Link to={`/facebook/post/${c.id}`} className="btn btn-primary btn-sm">
                            {t('facebook.postButton')}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
