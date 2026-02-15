import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A tag/chip input for entering multiple string values (e.g. usernames, venue names).
 *
 * @param {string[]} tags
 * @param {Function} onChange - (newTags: string[]) => void
 * @param {string} placeholder
 * @param {string} label
 */
export default function TagInput({ tags = [], onChange, placeholder, label }) {
  const [input, setInput] = useState('');
  const { t } = useTranslation();

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput('');
  };

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="form-control"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>
          {t('common.add')}
        </button>
      </div>
      {tags.length > 0 && (
        <div className="tag-list">
          {tags.map((tag, i) => (
            <span key={i} className="tag">
              {tag}
              <button type="button" onClick={() => removeTag(i)}>&times;</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
