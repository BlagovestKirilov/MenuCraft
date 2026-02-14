import { useState } from 'react';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { generateMenu } from '../api/venueApi';
import { getErrorMessage, downloadBlob } from '../utils/helpers';

function MealListBuilder({ label, meals, onChange }) {
  const addMeal = () => onChange([...meals, { name: '', price: '' }]);
  const removeMeal = (i) => onChange(meals.filter((_, idx) => idx !== i));
  const updateMeal = (i, field, val) => {
    const copy = [...meals];
    copy[i] = { ...copy[i], [field]: val };
    onChange(copy);
  };

  return (
    <div className="form-group">
      <div className="meal-list-header">
        <label>{label}</label>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addMeal}>
          + Add
        </button>
      </div>
      {meals.map((m, i) => (
        <div key={i} className="meal-item">
          <input
            className="form-control"
            placeholder="Meal name"
            value={m.name}
            onChange={(e) => updateMeal(i, 'name', e.target.value)}
          />
          <input
            className="form-control"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Price"
            value={m.price}
            onChange={(e) => updateMeal(i, 'price', e.target.value)}
          />
          <button type="button" className="remove-btn" onClick={() => removeMeal(i)}>
            &times;
          </button>
        </div>
      ))}
      {meals.length === 0 && (
        <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>
          No items yet. Click "+ Add" to start.
        </p>
      )}
    </div>
  );
}

export default function MenuGeneratorPage() {
  const [templateName, setTemplateName] = useState('');
  const [salads, setSalads] = useState([{ name: '', price: '' }]);
  const [soups, setSoups] = useState([{ name: '', price: '' }]);
  const [mainCourses, setMainCourses] = useState([{ name: '', price: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        templateName,
        salads: salads.filter((m) => m.name),
        soups: soups.filter((m) => m.name),
        mainCourses: mainCourses.filter((m) => m.name),
      };
      const blob = await generateMenu(payload);
      downloadBlob(blob, 'menu-filled.pdf');
      setSuccess('Menu PDF generated and downloaded!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Generate Menu</h1>
        <p>Fill in meal data and generate a PDF menu from a template.</p>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        <form onSubmit={handleSubmit}>
          <FormField
            label="Template Name"
            name="templateName"
            value={templateName}
            onChange={(_, v) => setTemplateName(v)}
            placeholder="Enter template name"
            required
          />

          <MealListBuilder label="Salads (1–20) *" meals={salads} onChange={setSalads} />
          <MealListBuilder label="Soups (1–20) *" meals={soups} onChange={setSoups} />
          <MealListBuilder label="Main Courses (1–30) *" meals={mainCourses} onChange={setMainCourses} />

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? 'Generating...' : 'Generate PDF Menu'}
          </button>
        </form>
      </div>
    </div>
  );
}
