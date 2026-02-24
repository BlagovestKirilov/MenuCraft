import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getErrorMessage } from '../utils/helpers';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <LanguageSwitcher />
        </div>
        <h1>{t('login.title')}</h1>
        <p className="subtitle">{t('login.subtitle')}</p>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label={t('login.username')}
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={t('login.usernamePlaceholder')}
            required
          />
          <FormField
            label={t('login.password')}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t('login.passwordPlaceholder')}
            required
          />
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

      </div>
    </div>
  );
}
