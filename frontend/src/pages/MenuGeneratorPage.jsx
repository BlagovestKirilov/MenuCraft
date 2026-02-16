import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormField from '../components/FormField';
import ErrorAlert from '../components/ErrorAlert';
import SuccessAlert from '../components/SuccessAlert';
import { generateMenu } from '../api/venueApi';
import { getErrorMessage, downloadBase64 } from '../utils/helpers';

function MealListBuilder({ label, meals, onChange, maxCount, t }) {
  const canAdd = !maxCount || meals.length < maxCount;

  const addMeal = () => {
    if (canAdd) onChange([...meals, { name: '', price: '' }]);
  };
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
        <button type="button" className="btn btn-secondary btn-sm" onClick={addMeal} disabled={!canAdd}>
          {t('menuGenerator.addMeal')}
        </button>
      </div>
      {meals.map((m, i) => (
        <div key={i} className="meal-item">
          <input
            className="form-control"
            placeholder={t('menuGenerator.mealNamePlaceholder')}
            value={m.name}
            onChange={(e) => updateMeal(i, 'name', e.target.value)}
          />
          <input
            className="form-control"
            type="number"
            step="0.01"
            min="0.01"
            placeholder={t('menuGenerator.pricePlaceholder')}
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
          {t('menuGenerator.noItems')}
        </p>
      )}
    </div>
  );
}

export default function MenuGeneratorPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Read from URL params (set by template click)
  const initialTemplate = searchParams.get('template') || '';
  const maxSalads = parseInt(searchParams.get('salads'), 10) || 0;
  const maxSoups = parseInt(searchParams.get('soups'), 10) || 0;
  const maxMainCourses = parseInt(searchParams.get('mainCourses'), 10) || 0;

  const hasLimits = maxSalads > 0 || maxSoups > 0 || maxMainCourses > 0;

  const [templateName, setTemplateName] = useState(initialTemplate);
  const [salads, setSalads] = useState([{ name: '', price: '' }]);
  const [soups, setSoups] = useState([{ name: '', price: '' }]);
  const [mainCourses, setMainCourses] = useState([{ name: '', price: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const buildLabel = (baseKey, max) => {
    if (max > 0) return `${t(baseKey)} (1–${max}) *`;
    return `${t(baseKey)} *`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate counts against limits
    const filledSalads = salads.filter((m) => m.name);
    const filledSoups = soups.filter((m) => m.name);
    const filledMainCourses = mainCourses.filter((m) => m.name);

    if (maxSalads > 0 && filledSalads.length > maxSalads) {
      setError(t('menuGenerator.limitError', { section: t('menuGenerator.saladsLabel'), max: maxSalads }));
      return;
    }
    if (maxSoups > 0 && filledSoups.length > maxSoups) {
      setError(t('menuGenerator.limitError', { section: t('menuGenerator.soupsLabel'), max: maxSoups }));
      return;
    }
    if (maxMainCourses > 0 && filledMainCourses.length > maxMainCourses) {
      setError(t('menuGenerator.limitError', { section: t('menuGenerator.mainCoursesLabel'), max: maxMainCourses }));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        templateName,
        salads: filledSalads,
        soups: filledSoups,
        mainCourses: filledMainCourses,
      };
      const res = await generateMenu(payload);
      downloadBase64(res.data, res.contentType || 'application/pdf', res.filename || 'menu-filled.pdf');
      setSuccess(t('menuGenerator.success'));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{t('menuGenerator.title')}</h1>
        <p>{t('menuGenerator.subtitle')}</p>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <ErrorAlert message={error} onClose={() => setError('')} />
        <SuccessAlert message={success} onClose={() => setSuccess('')} />

        {hasLimits && (
          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            {t('menuGenerator.limitsInfo', {
              salads: maxSalads || '—',
              soups: maxSoups || '—',
              mainCourses: maxMainCourses || '—',
            })}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            label={t('menuGenerator.templateName')}
            name="templateName"
            value={templateName}
            onChange={(_, v) => setTemplateName(v)}
            placeholder={t('menuGenerator.templateNamePlaceholder')}
            required
            readOnly={!!initialTemplate}
          />

          <MealListBuilder
            label={buildLabel('menuGenerator.saladsLabel', maxSalads)}
            meals={salads}
            onChange={setSalads}
            maxCount={maxSalads || undefined}
            t={t}
          />
          <MealListBuilder
            label={buildLabel('menuGenerator.soupsLabel', maxSoups)}
            meals={soups}
            onChange={setSoups}
            maxCount={maxSoups || undefined}
            t={t}
          />
          <MealListBuilder
            label={buildLabel('menuGenerator.mainCoursesLabel', maxMainCourses)}
            meals={mainCourses}
            onChange={setMainCourses}
            maxCount={maxMainCourses || undefined}
            t={t}
          />

          <button type="submit" className="btn btn-primary btn-lg btn-block mt-2" disabled={loading}>
            {loading ? t('menuGenerator.submitting') : t('menuGenerator.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
