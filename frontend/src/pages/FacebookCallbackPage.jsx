import { useSearchParams, Link } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';

export default function FacebookCallbackPage() {
  const [searchParams] = useSearchParams();

  const status = searchParams.get('status');
  const pages = searchParams.get('pages');
  const message = searchParams.get('message');

  const isSuccess = status === 'SUCCESS';

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        {isSuccess ? (
          <>
            <div className="text-center" style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
              &#10003;
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Facebook Connected!</h2>
            <p className="text-secondary text-center mb-2">
              {pages} page(s) linked successfully.
            </p>
            <div className="alert alert-success text-center">
              Your Facebook Page is now connected. You can start posting from the Facebook section.
            </div>
          </>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Connection Failed</h2>
            <ErrorAlert message={message || 'Something went wrong during the Facebook connection.'} />
          </>
        )}

        <Link to="/facebook" className="btn btn-primary btn-block mt-2">
          Go to Facebook
        </Link>
      </div>
    </div>
  );
}
