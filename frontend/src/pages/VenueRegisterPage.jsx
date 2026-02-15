import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import TagInput from '../components/TagInput';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { registerVenue } from '../api/venueApi';
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
  const [form, setForm] = useState(INITIAL);
  const [usernames, setUsernames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = { ...form, accountUsernames: usernames };
      await registerVenue(payload);
      setSuccess(t('venueRegister.success'));
      setForm(INITIAL);
      setUsernames([]);
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

          <TagInput
            label={t('venueRegister.accountUsernames')}
            tags={usernames}
            onChange={setUsernames}
            placeholder={t('venueRegister.accountUsernamesPlaceholder')}
          />

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('venueRegister.submitting') : t('venueRegister.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
