import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadTemplateFile } from '../api/adminApi';
import { getErrorMessage, downloadBlob } from '../utils/helpers';

export default function AdminTemplateListPage() {
  const { t } = useTranslation();
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
        <h1>{t('adminTemplateList.title')}</h1>
        <p>{t('adminTemplateList.subtitle')}</p>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleDownload}>
          <FormField
            label={t('adminTemplateList.templateId')}
            name="templateId"
            value={templateId}
            onChange={(_, v) => setTemplateId(v)}
            placeholder={t('adminTemplateList.templateIdPlaceholder')}
            required
          />
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? t('adminTemplateList.submitting') : t('adminTemplateList.submit')}
          </button>
        </form>

        {loading && <LoadingSpinner />}
      </div>
    </div>
  );
}
