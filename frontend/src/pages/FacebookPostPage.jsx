import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { postToFacebook } from '../api/facebookApi';
import { getErrorMessage } from '../utils/helpers';

export default function FacebookPostPage() {
  const { connectionId } = useParams();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selected.type)) {
      setError(t('facebookPost.fileHint'));
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError(t('facebookPost.fileHint'));
      return;
    }

    setFile(selected);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setFileBase64(base64);
    };
    reader.readAsDataURL(selected);
  };

  const removeFile = () => {
    setFile(null);
    setFileBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        connectionId,
        message,
        ...(fileBase64 ? { base64Photo: fileBase64 } : {}),
      };
      const res = await postToFacebook(payload);
      setSuccess(t('facebookPost.success', { postId: res.postId }));
      setMessage('');
      removeFile();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('facebookPost.title')}</h1>
        <p>
          {t('facebookPost.connection')} <code>{connectionId}</code>
        </p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label={t('facebookPost.message')}
            name="message"
            type="textarea"
            value={message}
            onChange={(_, v) => setMessage(v)}
            placeholder={t('facebookPost.messagePlaceholder')}
            required
          />

          <div className="form-group">
            <label>{t('facebookPost.fileLabel')}</label>
            {!file ? (
              <div
                className="file-upload-zone"
                onClick={() => fileInputRef.current?.click()}
              >
                <p>{t('facebookPost.fileDrop')}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--color-primary)',
              }}>
                <span style={{ flex: 1, fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                  {file.name}
                </span>
                <button type="button" className="btn btn-danger btn-sm" onClick={removeFile}>
                  {t('facebookPost.removeFile')}
                </button>
              </div>
            )}
            <div className="form-hint">{t('facebookPost.fileHint')}</div>
          </div>

          <button type="submit" className="btn btn-facebook btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('facebookPost.submitting') : t('facebookPost.submit')}
          </button>
        </form>

        <div className="mt-2">
          <Link to="/venues" className="btn btn-secondary">
            {t('facebookPost.backToVenues')}
          </Link>
        </div>
      </div>
    </div>
  );
}
