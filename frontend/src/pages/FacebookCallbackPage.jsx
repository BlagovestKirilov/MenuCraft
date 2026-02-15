import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ErrorAlert from '../components/ErrorAlert';

export default function FacebookCallbackPage() {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

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
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{t('facebookCallback.successTitle')}</h2>
            <p className="text-secondary text-center mb-2">
              {t('facebookCallback.successMessage', { count: pages })}
            </p>
            <div className="alert alert-success text-center">
              {t('facebookCallback.successInfo')}
            </div>
          </>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{t('facebookCallback.failTitle')}</h2>
            <ErrorAlert message={message || t('facebookCallback.failMessage')} />
          </>
        )}

        <Link to="/facebook" className="btn btn-primary btn-block mt-2">
          {t('facebookCallback.goToFacebook')}
        </Link>
      </div>
    </div>
  );
}
