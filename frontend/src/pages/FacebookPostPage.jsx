import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { postToFacebook } from '../api/facebookApi';
import { getErrorMessage } from '../utils/helpers';

export default function FacebookPostPage() {
  const { connectionId } = useParams();

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
      setSuccess(`Post published! ID: ${res.postId}`);
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
        <h1>Post to Facebook</h1>
        <p>
          Connection: <code>{connectionId}</code>
        </p>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label="Message"
            name="message"
            type="textarea"
            value={message}
            onChange={(_, v) => setMessage(v)}
            placeholder="What do you want to post?"
            required
          />
          <FormField
            label="Photo URL (optional)"
            name="photoUrl"
            value={photoUrl}
            onChange={(_, v) => setPhotoUrl(v)}
            placeholder="https://example.com/image.jpg"
            hint="Publicly accessible image URL for photo posts"
          />
          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>

        <div className="mt-2">
          <Link to="/facebook" className="btn btn-secondary">
            Back to Facebook
          </Link>
        </div>
      </div>
    </div>
  );
}
