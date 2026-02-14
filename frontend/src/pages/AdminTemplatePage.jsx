import { useState } from 'react';
import FormField from '../components/FormField';
import FileUpload from '../components/FileUpload';
import TagInput from '../components/TagInput';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { addTemplate } from '../api/adminApi';
import { getErrorMessage, fileToBase64 } from '../utils/helpers';

const SECTION_TYPES = [
  { value: 'SOUP', label: 'Soup' },
  { value: 'SALAD', label: 'Salad' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'DESSERT', label: 'Dessert' },
];

export default function AdminTemplatePage() {
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
      setError('Please upload a template file.');
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
      setSuccess('Template added successfully!');
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
        <h1>Add Template</h1>
        <p>Upload a PDF template with sections and assign to venues.</p>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label="Template Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="2-100 characters"
            required
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional, max 500 chars"
          />
          <FormField
            label="Content Type"
            name="contentType"
            value={form.contentType}
            onChange={handleChange}
            placeholder="application/pdf"
          />

          <div className="form-group">
            <label>Template File (PDF) *</label>
            <FileUpload onFileSelect={handleFileSelect} accept=".pdf" label="Drop a PDF file or click to browse" />
          </div>

          {/* Sections */}
          <div className="form-group">
            <div className="meal-list-header">
              <label>Template Sections</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSection}>
                + Add Section
              </button>
            </div>
            {sections.map((s, i) => (
              <div key={i} className="section-item">
                <select
                  className="form-control"
                  value={s.type}
                  onChange={(e) => updateSection(i, 'type', e.target.value)}
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder="Slots"
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
            label="Venue Names *"
            tags={venueNames}
            onChange={setVenueNames}
            placeholder="Type venue name and press Enter"
          />

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? 'Uploading...' : 'Add Template'}
          </button>
        </form>
      </div>
    </div>
  );
}
