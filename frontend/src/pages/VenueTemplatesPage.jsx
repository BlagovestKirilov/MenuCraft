import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getTemplatesByVenue, getVenues } from '../api/venueApi';
import { getErrorMessage } from '../utils/helpers';

export default function VenueTemplatesPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const didFetch = useRef(false);

  const initialVenue = searchParams.get('venue') || '';
  const venueLockedFromUrl = !!searchParams.get('venue');

  const [venues, setVenues] = useState([]);
  const [venueName, setVenueName] = useState(initialVenue);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const fetchTemplates = async (name) => {
    if (!name) return;
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const data = await getTemplatesByVenue(name);
      setTemplates(data.templates || []);
    } catch (err) {
      setError(getErrorMessage(err));
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const init = async () => {
      try {
        const venuesData = await getVenues();
        const venueList = venuesData.venues || [];
        setVenues(venueList);
        const startVenue = initialVenue || (venueList.length > 0 ? venueList[0].name : '');
        if (startVenue) {
          setVenueName(startVenue);
          await fetchTemplates(startVenue);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(getErrorMessage(err));
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVenueChange = (e) => {
    const name = e.target.value;
    setVenueName(name);
    if (name) fetchTemplates(name);
    else { setTemplates([]); setSearched(false); }
  };

  const handleTemplateClick = (tpl) => {
    const sections = {};
    tpl.sections?.forEach((s) => {
      const key = s.type?.toLowerCase();
      if (key === 'salad') sections.salads = s.slotCount;
      else if (key === 'soup') sections.soups = s.slotCount;
      else if (key === 'main_course') sections.mainCourses = s.slotCount;
    });

    const params = new URLSearchParams();
    params.set('template', tpl.name);
    if (venueName) params.set('venue', venueName);
    if (sections.salads) params.set('salads', sections.salads);
    if (sections.soups) params.set('soups', sections.soups);
    if (sections.mainCourses) params.set('mainCourses', sections.mainCourses);

    navigate(`/menu/generate?${params.toString()}`);
  };

  const handlePreview = (e, tpl) => {
    e.stopPropagation();
    if (tpl.data) {
      setPreviewData(tpl.data);
    }
  };

  const closePreview = () => setPreviewData(null);

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>{t('venueTemplates.title')}</h1>
            <p>{t('venueTemplates.subtitle')}</p>
          </div>
          {isAdmin && (
            <Link to="/admin/template" className="btn btn-primary btn-lg">
              {t('venueTemplates.addTemplate')}
            </Link>
          )}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 960 }}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>{t('venueTemplates.venueLabel')}</label>
          {venueLockedFromUrl ? (
            <input className="form-control" value={venueName} readOnly />
          ) : (
            <select className="form-control" value={venueName} onChange={handleVenueChange}>
              {venues.map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          )}
        </div>

        <ErrorAlert message={error} onClose={() => setError('')} />

        {loading && <LoadingSpinner />}

        {!loading && searched && templates.length === 0 && !error && (
          <p className="text-secondary text-center mt-2">{t('venueTemplates.noTemplates')}</p>
        )}

        {templates.length > 0 && (
          <>
            <p className="text-secondary" style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              {t('venueTemplates.clickHint')}
            </p>
            <div className="table-wrapper mt-2">
              <table>
                <thead>
                  <tr>
                    <th>{t('venueTemplates.name')}</th>
                    <th>{t('venueTemplates.description')}</th>
                    <th>{t('venueTemplates.sections')}</th>
                    <th>{t('venueTemplates.preview')}</th>
                    <th>{t('venueTemplates.created')}</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl, i) => (
                    <tr
                      key={i}
                      className="clickable-row"
                      onClick={() => handleTemplateClick(tpl)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleTemplateClick(tpl)}
                    >
                      <td style={{ fontWeight: 600 }}>{tpl.name}</td>
                      <td>{tpl.description || '—'}</td>
                      <td>
                        {tpl.sections?.map((s, j) => (
                          <span key={j} className="badge badge-success" style={{ marginRight: 4 }}>
                            {s.type} ({s.slotCount})
                          </span>
                        ))}
                      </td>
                      <td>
                        {tpl.data ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => handlePreview(e, tpl)}
                          >
                            {t('venueTemplates.viewPdf')}
                          </button>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.8125rem' }}>
                        {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewData && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{t('venueTemplates.pdfPreview')}</h3>
              <button className="btn btn-secondary btn-sm" onClick={closePreview}>&times;</button>
            </div>
            <iframe
              src={`data:application/pdf;base64,${previewData}`}
              title="PDF Preview"
              style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 'var(--radius)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
