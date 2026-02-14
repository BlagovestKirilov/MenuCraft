import { useState } from 'react';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadTemplateFile } from '../api/adminApi';
import { getErrorMessage, downloadBlob } from '../utils/helpers';

export default function AdminTemplateListPage() {
  const [templateId, setTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!templateId.trim()) return;
    setError('');
    setLoading(true);
    try {
      const blob = await downloadTemplateFile(templateId.trim());
      downloadBlob(blob, `template-${templateId}.pdf`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Download Template File</h1>
        <p>Enter a template ID to download its file.</p>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleDownload}>
          <FormField
            label="Template UUID"
            name="templateId"
            value={templateId}
            onChange={(_, v) => setTemplateId(v)}
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            required
          />
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? 'Downloading...' : 'Download File'}
          </button>
        </form>

        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
}
