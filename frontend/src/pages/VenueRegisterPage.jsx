import { useState } from 'react';
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
      setSuccess('Venue registered successfully!');
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
        <h1>Register Venue</h1>
        <p>Create a new venue and link it to user accounts.</p>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <FormField label="Venue Name" name="name" value={form.name} onChange={handleChange} placeholder="2-100 characters" required />

          <div className="form-row">
            <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="venue@example.com" required />
            <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="6-20 characters" required />
          </div>

          <div className="form-row">
            <FormField label="City" name="city" value={form.city} onChange={handleChange} required />
            <FormField label="Address" name="address" value={form.address} onChange={handleChange} required />
          </div>

          <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} placeholder="Optional, max 500 chars" />

          <TagInput
            label="Account Usernames *"
            tags={usernames}
            onChange={setUsernames}
            placeholder="Type username and press Enter"
          />

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? 'Registering...' : 'Register Venue'}
          </button>
        </form>
      </div>
    </div>
  );
}
