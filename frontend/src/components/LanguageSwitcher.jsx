import { useTranslation } from 'react-i18next';

function FlagGB() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="12">
      <clipPath id="gb"><rect width="60" height="30" /></clipPath>
      <g clipPath="url(#gb)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#gb)" />
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function FlagBG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" width="24" height="14">
      <rect width="5" height="1" fill="#fff" />
      <rect width="5" height="1" y="1" fill="#00966E" />
      <rect width="5" height="1" y="2" fill="#D62612" />
    </svg>
  );
}

const LANGUAGES = [
  { code: 'en', Flag: FlagGB },
  { code: 'bg', Flag: FlagBG },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="language-switcher">
      {LANGUAGES.map(({ code, Flag }) => (
        <button
          key={code}
          className={`lang-btn ${i18n.language?.startsWith(code) ? 'lang-btn-active' : ''}`}
          onClick={() => i18n.changeLanguage(code)}
          title={code.toUpperCase()}
        >
          <Flag />
        </button>
      ))}
    </div>
  );
}
