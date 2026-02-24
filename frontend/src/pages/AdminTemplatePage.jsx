import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import FileUpload from '../components/FileUpload';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { addTemplate } from '../api/adminApi';
import { getVenues } from '../api/venueApi';
import { getErrorMessage, fileToBase64 } from '../utils/helpers';

export default function AdminTemplatePage() {
  const { t } = useTranslation();
  const didFetch = useRef(false);

  const SECTION_TYPES = [
    { value: 'SOUP', label: t('adminTemplate.sectionSoup') },
    { value: 'SALAD', label: t('adminTemplate.sectionSalad') },
    { value: 'MAIN_COURSE', label: t('adminTemplate.sectionMainCourse') },
    { value: 'DESSERT', label: t('adminTemplate.sectionDessert') },
  ];

  const [form, setForm] = useState({ name: '', description: '', contentType: 'application/pdf' });
  const [fileBase64, setFileBase64] = useState('');
  const [sections, setSections] = useState([{ type: 'SALAD', slotCount: '' }]);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    const loadVenues = async () => {
      try {
        const data = await getVenues();
        const list = data.venues || [];
        setVenues(list);
        if (list.length > 0) setSelectedVenue(list[0].name);
      } catch { /* non-critical */ }
    };
    loadVenues();
  }, []);

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleFileSelect = async (file) => {
    const b64 = await fileToBase64(file);
    setFileBase64(b64);
  };

  const addSection = () => setSections([...sections, { type: 'SOUP', slotCount: '' }]);
  const removeSection = (i) => setSections(sections.filter((_, idx) => idx !== i));
  const updateSection = (i, field, val) => {
    const copy = [...sections];
    copy[i] = { ...copy[i], [field]: val };
    setSections(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!fileBase64) {
      setError(t('adminTemplate.fileRequired'));
      return;
    }
    if (!selectedVenue) {
      setError(t('adminTemplate.venueRequired'));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        data: fileBase64,
        sections: sections.map((s) => ({
          type: s.type,
          slotCount: parseInt(s.slotCount, 10),
        })),
        venueNames: [selectedVenue],
      };
      await addTemplate(payload);
      setSuccess(t('adminTemplate.success'));
      setForm({ name: '', description: '', contentType: 'application/pdf' });
      setFileBase64('');
      setSections([{ type: 'SALAD', slotCount: '' }]);
      if (venues.length > 0) setSelectedVenue(venues[0].name);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('adminTemplate.title')}</h1>
        <p>{t('adminTemplate.subtitle')}</p>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label={t('adminTemplate.name')}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t('adminTemplate.namePlaceholder')}
            required
          />
          <FormField
            label={t('adminTemplate.description')}
            name="description"
            type="textarea"
            value={form.description}
            onChange={handleChange}
            placeholder={t('adminTemplate.descriptionPlaceholder')}
          />
          <div className="form-group">
            <label>{t('adminTemplate.fileLabel')}</label>
            <FileUpload onFileSelect={handleFileSelect} accept=".pdf" label={t('adminTemplate.fileDrop')} />
          </div>

          {/* Sections */}
          <div className="form-group">
            <div className="meal-list-header">
              <label>{t('adminTemplate.sections')}</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSection}>
                {t('adminTemplate.addSection')}
              </button>
            </div>
            {sections.map((s, i) => (
              <div key={i} className="section-item">
                <select
                  className="form-control"
                  value={s.type}
                  onChange={(e) => updateSection(i, 'type', e.target.value)}
                >
                  {SECTION_TYPES.map((tp) => (
                    <option key={tp.value} value={tp.value}>
                      {tp.label}
                    </option>
                  ))}
                </select>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder={t('adminTemplate.slotsPlaceholder')}
                  value={s.slotCount}
                  onChange={(e) => updateSection(i, 'slotCount', e.target.value)}
                />
                <button type="button" className="remove-btn" onClick={() => removeSection(i)}>
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>{t('adminTemplate.venueName')}</label>
            <select className="form-control" value={selectedVenue} onChange={(e) => setSelectedVenue(e.target.value)} required>
              {venues.map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('adminTemplate.submitting') : t('adminTemplate.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
