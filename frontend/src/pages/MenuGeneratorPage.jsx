import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { generateMenu, getVenues } from '../api/venueApi';
import { postToFacebook } from '../api/facebookApi';
import { getErrorMessage, downloadBase64 } from '../utils/helpers';

function MealListBuilder({ label, meals, onChange, maxCount, t }) {
  const canAdd = !maxCount || meals.length < maxCount;

  const addMeal = () => {
    if (canAdd) onChange([...meals, { name: '', price: '' }]);
  };
  const removeMeal = (i) => onChange(meals.filter((_, idx) => idx !== i));
  const updateMeal = (i, field, val) => {
    const copy = [...meals];
    copy[i] = { ...copy[i], [field]: val };
    onChange(copy);
  };

  return (
    <div className="form-group">
      <div className="meal-list-header">
        <label>{label}</label>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addMeal} disabled={!canAdd}>
          {t('menuGenerator.addMeal')}
        </button>
      </div>
      {meals.map((m, i) => (
        <div key={i} className="meal-item">
          <input
            className="form-control"
            placeholder={t('menuGenerator.mealNamePlaceholder')}
            value={m.name}
            onChange={(e) => updateMeal(i, 'name', e.target.value)}
          />
          <input
            className="form-control"
            type="number"
            step="0.01"
            min="0.01"
            placeholder={t('menuGenerator.pricePlaceholder')}
            value={m.price}
            onChange={(e) => updateMeal(i, 'price', e.target.value)}
          />
          <button type="button" className="remove-btn" onClick={() => removeMeal(i)}>
            &times;
          </button>
        </div>
      ))}
      {meals.length === 0 && (
        <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>
          {t('menuGenerator.noItems')}
        </p>
      )}
    </div>
  );
}

export default function MenuGeneratorPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const didFetchVenues = useRef(false);

  const initialTemplate = searchParams.get('template') || '';
  const initialVenue = searchParams.get('venue') || '';
  const maxSalads = parseInt(searchParams.get('salads'), 10) || 0;
  const maxSoups = parseInt(searchParams.get('soups'), 10) || 0;
  const maxMainCourses = parseInt(searchParams.get('mainCourses'), 10) || 0;

  const hasLimits = maxSalads > 0 || maxSoups > 0 || maxMainCourses > 0;

  const [templateName, setTemplateName] = useState(initialTemplate);
  const [salads, setSalads] = useState([{ name: '', price: '' }]);
  const [soups, setSoups] = useState([{ name: '', price: '' }]);
  const [mainCourses, setMainCourses] = useState([{ name: '', price: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Preview modal state
  const [previewPdf, setPreviewPdf] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [menuFilename, setMenuFilename] = useState('menu-filled.pdf');
  const [menuContentType, setMenuContentType] = useState('application/pdf');

  // Facebook connections from the venue
  const [activeConnections, setActiveConnections] = useState([]);

  // Facebook post modal state
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  useEffect(() => {
    if (!initialVenue || didFetchVenues.current) return;
    didFetchVenues.current = true;

    const loadConnections = async () => {
      try {
        const data = await getVenues();
        const venues = data.venues || [];
        const venue = venues.find((v) => v.name === initialVenue);
        if (venue?.facebookConnections) {
          const connected = venue.facebookConnections.filter((c) => c.status === 'CONNECTED');
          setActiveConnections(connected);
          if (connected.length > 0) setSelectedConnection(connected[0].id);
        }
      } catch {
        // non-critical — just hide the Facebook button
      }
    };
    loadConnections();
  }, [initialVenue]);

  const buildLabel = (baseKey, max) => {
    if (max > 0) return `${t(baseKey)} (1–${max}) *`;
    return `${t(baseKey)} *`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const filledSalads = salads.filter((m) => m.name);
    const filledSoups = soups.filter((m) => m.name);
    const filledMainCourses = mainCourses.filter((m) => m.name);

    if (maxSalads > 0 && filledSalads.length > maxSalads) {
      setError(t('menuGenerator.limitError', { section: t('menuGenerator.saladsLabel'), max: maxSalads }));
      return;
    }
    if (maxSoups > 0 && filledSoups.length > maxSoups) {
      setError(t('menuGenerator.limitError', { section: t('menuGenerator.soupsLabel'), max: maxSoups }));
      return;
    }
    if (maxMainCourses > 0 && filledMainCourses.length > maxMainCourses) {
      setError(t('menuGenerator.limitError', { section: t('menuGenerator.mainCoursesLabel'), max: maxMainCourses }));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        templateName,
        salads: filledSalads,
        soups: filledSoups,
        mainCourses: filledMainCourses,
      };
      const res = await generateMenu(payload);
      setPreviewPdf(res.data);
      setPreviewImage(res.previewImage || null);
      setMenuFilename(res.filename || 'menu-filled.pdf');
      setMenuContentType(res.contentType || 'application/pdf');
      setSuccess(t('menuGenerator.success'));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewPdf) {
      downloadBase64(previewPdf, menuContentType, menuFilename);
    }
  };

  const closePreview = () => {
    setPreviewPdf(null);
    setPreviewImage(null);
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
        <h1>{t('menuGenerator.title')}</h1>
        <p>{t('menuGenerator.subtitle')}</p>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        {hasLimits && (
          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            {t('menuGenerator.limitsInfo', {
              salads: maxSalads || '—',
              soups: maxSoups || '—',
              mainCourses: maxMainCourses || '—',
            })}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            label={t('menuGenerator.templateName')}
            name="templateName"
            value={templateName}
            onChange={(_, v) => setTemplateName(v)}
            placeholder={t('menuGenerator.templateNamePlaceholder')}
            required
            readOnly={!!initialTemplate}
          />

          <MealListBuilder
            label={buildLabel('menuGenerator.saladsLabel', maxSalads)}
            meals={salads}
            onChange={setSalads}
            maxCount={maxSalads || undefined}
            t={t}
          />
          <MealListBuilder
            label={buildLabel('menuGenerator.soupsLabel', maxSoups)}
            meals={soups}
            onChange={setSoups}
            maxCount={maxSoups || undefined}
            t={t}
          />
          <MealListBuilder
            label={buildLabel('menuGenerator.mainCoursesLabel', maxMainCourses)}
            meals={mainCourses}
            onChange={setMainCourses}
            maxCount={maxMainCourses || undefined}
            t={t}
          />

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('menuGenerator.submitting') : t('menuGenerator.submit')}
          </button>
        </form>
      </div>

      {/* ── PDF Preview Modal ── */}
      {previewPdf && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 960 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{t('menuGenerator.previewTitle')}</h3>
              <button className="btn btn-secondary btn-sm" onClick={closePreview}>&times;</button>
            </div>

            <iframe
              src={`data:application/pdf;base64,${previewPdf}`}
              title="Menu Preview"
              style={{ width: '100%', height: '60vh', border: 'none', borderRadius: 'var(--radius)', marginBottom: '1rem' }}
            />

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleDownload}>
                {t('common.download')}
              </button>
              {activeConnections.length > 0 && !showPostForm && (
                <button className="btn btn-facebook" onClick={() => setShowPostForm(true)}>
                  {t('menuGenerator.postToFacebook')}
                </button>
              )}
            </div>

            {/* Post success */}
            {postSuccess && (
              <div className="alert alert-success" style={{ marginTop: '1rem' }}>
                {postSuccess}
              </div>
            )}

            {/* ── Facebook Post Form (inline) ── */}
            {showPostForm && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>{t('menuGenerator.postToFacebook')}</h4>

                {postError && <ErrorAlert message={postError} onClose={() => setPostError('')} />}

                <form onSubmit={handlePostToFacebook}>
                  {activeConnections.length > 1 && (
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>{t('menuGenerator.selectPage')}</label>
                      <select
                        className="form-control"
                        value={selectedConnection}
                        onChange={(e) => setSelectedConnection(e.target.value)}
                      >
                        {activeConnections.map((c) => (
                          <option key={c.id} value={c.id}>{c.pageName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {activeConnections.length === 1 && (
                    <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      {t('menuGenerator.postingTo')}: <strong>{activeConnections[0].pageName}</strong>
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
          </div>
        </div>
      )}
    </div>
  );
}
