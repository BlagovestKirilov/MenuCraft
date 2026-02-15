import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getErrorMessage } from '../utils/helpers';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({ username: '', password: '', role: 'COMPANY' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const ROLES = [
    { value: 'COMPANY', label: t('register.roleCompany') },
    { value: 'ADMIN', label: t('register.roleAdmin') },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
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
        <h1>{t('register.title')}</h1>
        <p className="subtitle">{t('register.subtitle')}</p>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label={t('register.username')}
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={t('register.usernamePlaceholder')}
            required
          />
          <FormField
            label={t('register.password')}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t('register.passwordPlaceholder')}
            required
          />
          <FormField
            label={t('register.role')}
            name="role"
            type="select"
            value={form.role}
            onChange={handleChange}
            options={ROLES}
            required
          />
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <div className="auth-footer">
          {t('register.hasAccount')} <Link to="/auth/login">{t('register.loginLink')}</Link>
        </div>
      </div>
    </div>
  );
}
