import { useState } from 'react';
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

  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        connectionId,
        message,
        ...(photoUrl.trim() ? { photoUrl: photoUrl.trim() } : {}),
      };
      const res = await postToFacebook(payload);
      setSuccess(t('facebookPost.success', { postId: res.postId }));
      setMessage('');
      setPhotoUrl('');
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
          <FormField
            label={t('facebookPost.photoUrl')}
            name="photoUrl"
            value={photoUrl}
            onChange={(_, v) => setPhotoUrl(v)}
            placeholder={t('facebookPost.photoUrlPlaceholder')}
            hint={t('facebookPost.photoUrlHint')}
          />
          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('facebookPost.submitting') : t('facebookPost.submit')}
          </button>
        </form>

        <div className="mt-2">
          <Link to="/facebook" className="btn btn-secondary">
            {t('facebookPost.backToFacebook')}
          </Link>
        </div>
      </div>
    </div>
  );
}
