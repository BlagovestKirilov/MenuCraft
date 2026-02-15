import { useTranslation } from 'react-i18next';

/**
 * Reusable form field with label, input, and error display.
 *
 * @param {string} label
 * @param {string} name
 * @param {string} type - input type (text, email, password, number, select, textarea)
 * @param {string} value
 * @param {Function} onChange
 * @param {string} error
 * @param {string} placeholder
 * @param {string} hint
 * @param {Array} options - for select: [{ value, label }]
 * @param {boolean} required
 */
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  hint,
  options,
  required = false,
  ...rest
}) {
  const { t } = useTranslation();
  const id = `field-${name}`;

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  let input;
  if (type === 'select') {
    input = (
      <select id={id} className="form-control" value={value} onChange={handleChange} required={required} {...rest}>
        <option value="">{t('common.select')}</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  } else if (type === 'textarea') {
    input = (
      <textarea
        id={id}
        className="form-control"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
    );
  } else {
    input = (
      <input
        id={id}
        type={type}
        className="form-control"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
    );
  }

  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}{required && ' *'}</label>}
      {input}
      {hint && <div className="form-hint">{hint}</div>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
