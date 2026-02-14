import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import { getErrorMessage } from '../utils/helpers';

const ROLES = [
  { value: 'COMPANY', label: 'Company' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '', role: 'COMPANY' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));

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
        <h1>Create Account</h1>
        <p className="subtitle">Register a new MenuCraft account</p>

        <ErrorAlert message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="4-20 alphanumeric characters"
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="5-50 characters"
            required
          />
          <FormField
            label="Role"
            name="role"
            type="select"
            value={form.role}
            onChange={handleChange}
            options={ROLES}
            required
          />
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
