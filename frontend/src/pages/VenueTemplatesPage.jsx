import { useState } from 'react';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getTemplatesByVenue } from '../api/venueApi';
import { getErrorMessage } from '../utils/helpers';

export default function VenueTemplatesPage() {
  const [venueName, setVenueName] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!venueName.trim()) return;
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const data = await getTemplatesByVenue(venueName.trim());
      setTemplates(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Venue Templates</h1>
        <p>Look up templates assigned to a venue.</p>
      </div>

      <div className="card" style={{ maxWidth: 800 }}>
        <form onSubmit={handleSearch} className="flex gap-1 items-center mb-2">
          <div style={{ flex: 1 }}>
            <FormField
              name="venueName"
              value={venueName}
              onChange={(_, v) => setVenueName(v)}
              placeholder="Enter venue name"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Search
          </button>
        </form>

        <ErrorAlert message={error} onClose={() => setError('')} />

        {loading && <LoadingSpinner />}

        {!loading && searched && templates.length === 0 && !error && (
          <p className="text-secondary text-center mt-2">No templates found for this venue.</p>
        )}

        {templates.length > 0 && (
          <div className="table-wrapper mt-2">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Content Type</th>
                  <th>Sections</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td>{t.description || '—'}</td>
                    <td>
                      <span className="badge badge-info">{t.contentType || 'N/A'}</span>
                    </td>
                    <td>
                      {t.sections?.map((s, j) => (
                        <span key={j} className="badge badge-success" style={{ marginRight: 4 }}>
                          {s.type} ({s.slotCount})
                        </span>
                      ))}
                    </td>
                    <td className="text-secondary" style={{ fontSize: '0.8125rem' }}>
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
