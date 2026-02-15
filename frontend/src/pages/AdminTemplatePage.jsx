import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import FileUpload from '../components/FileUpload';
import TagInput from '../components/TagInput';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { addTemplate } from '../api/adminApi';
import { getErrorMessage, fileToBase64 } from '../utils/helpers';

export default function AdminTemplatePage() {
  const { t } = useTranslation();

  const SECTION_TYPES = [
    { value: 'SOUP', label: t('adminTemplate.sectionSoup') },
    { value: 'SALAD', label: t('adminTemplate.sectionSalad') },
    { value: 'MAIN_COURSE', label: t('adminTemplate.sectionMainCourse') },
    { value: 'DESSERT', label: t('adminTemplate.sectionDessert') },
  ];

  const [form, setForm] = useState({ name: '', description: '', contentType: 'application/pdf' });
  const [fileBase64, setFileBase64] = useState('');
  const [sections, setSections] = useState([{ type: 'SALAD', slotCount: '' }]);
  const [venueNames, setVenueNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setLoading(true);
    try {
      const payload = {
        ...form,
        data: fileBase64,
        sections: sections.map((s) => ({
          type: s.type,
          slotCount: parseInt(s.slotCount, 10),
        })),
        venueNames,
      };
      await addTemplate(payload);
      setSuccess(t('adminTemplate.success'));
      setForm({ name: '', description: '', contentType: 'application/pdf' });
      setFileBase64('');
      setSections([{ type: 'SALAD', slotCount: '' }]);
      setVenueNames([]);
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
          <FormField
            label={t('adminTemplate.contentType')}
            name="contentType"
            value={form.contentType}
            onChange={handleChange}
            placeholder={t('adminTemplate.contentTypePlaceholder')}
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

          <TagInput
            label={t('adminTemplate.venueNames')}
            tags={venueNames}
            onChange={setVenueNames}
            placeholder={t('adminTemplate.venueNamesPlaceholder')}
          />

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('adminTemplate.submitting') : t('adminTemplate.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
