import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { registerAccount } from '../api/adminApi';
import { getErrorMessage } from '../utils/helpers';

export default function AdminRegisterPage() {
  const { t } = useTranslation();

  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', role: 'COMPANY' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const ROLES = [
    { value: 'COMPANY', label: t('adminRegister.roleCompany') },
    { value: 'ADMIN', label: t('adminRegister.roleAdmin') },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError(t('adminRegister.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await registerAccount(payload);
      setSuccess(t('adminRegister.success'));
      setForm({ username: '', password: '', confirmPassword: '', role: 'COMPANY' });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('adminRegister.title')}</h1>
        <p>{t('adminRegister.subtitle')}</p>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label={t('adminRegister.username')}
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={t('adminRegister.usernamePlaceholder')}
            required
          />
          <FormField
            label={t('adminRegister.password')}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t('adminRegister.passwordPlaceholder')}
            required
          />
          <FormField
            label={t('adminRegister.confirmPassword')}
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder={t('adminRegister.confirmPasswordPlaceholder')}
            required
          />
          <FormField
            label={t('adminRegister.role')}
            name="role"
            type="select"
            value={form.role}
            onChange={handleChange}
            options={ROLES}
            required
          />
          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('adminRegister.submitting') : t('adminRegister.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
