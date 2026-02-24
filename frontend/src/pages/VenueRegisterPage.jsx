import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { registerVenue } from '../api/venueApi';
import { getCompanyAccounts } from '../api/adminApi';
import { getErrorMessage } from '../utils/helpers';

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  description: '',
};

export default function VenueRegisterPage() {
  const { t } = useTranslation();
  const didFetch = useRef(false);
  const [form, setForm] = useState(INITIAL);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    const load = async () => {
      try {
        const list = await getCompanyAccounts();
        setAccounts(list || []);
        if (list && list.length > 0) setSelectedAccount(list[0]);
      } catch { /* non-critical */ }
    };
    load();
  }, []);

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedAccount) {
      setError(t('venueRegister.accountRequired'));
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, accountUsernames: [selectedAccount] };
      await registerVenue(payload);
      setSuccess(t('venueRegister.success'));
      setForm(INITIAL);
      if (accounts.length > 0) setSelectedAccount(accounts[0]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('venueRegister.title')}</h1>
        <p>{t('venueRegister.subtitle')}</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <FormField label={t('venueRegister.name')} name="name" value={form.name} onChange={handleChange} placeholder={t('venueRegister.namePlaceholder')} required />

          <div className="form-row">
            <FormField label={t('venueRegister.email')} name="email" type="email" value={form.email} onChange={handleChange} placeholder={t('venueRegister.emailPlaceholder')} required />
            <FormField label={t('venueRegister.phone')} name="phone" value={form.phone} onChange={handleChange} placeholder={t('venueRegister.phonePlaceholder')} required />
          </div>

          <div className="form-row">
            <FormField label={t('venueRegister.city')} name="city" value={form.city} onChange={handleChange} required />
            <FormField label={t('venueRegister.address')} name="address" value={form.address} onChange={handleChange} required />
          </div>

          <FormField label={t('venueRegister.description')} name="description" type="textarea" value={form.description} onChange={handleChange} placeholder={t('venueRegister.descriptionPlaceholder')} />

          <div className="form-group">
            <label>{t('venueRegister.accountLabel')} *</label>
            <select className="form-control" value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} required>
              {accounts.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('venueRegister.submitting') : t('venueRegister.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
