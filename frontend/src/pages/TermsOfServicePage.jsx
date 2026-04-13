import { useTranslation } from 'react-i18next';

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 800 }}>
        <h1>{t('terms.title')}</h1>
        <p className="text-secondary mb-2">{t('terms.lastUpdated')}</p>

        <h2>{t('terms.acceptanceTitle')}</h2>
        <p>{t('terms.acceptanceText')}</p>

        <h2>{t('terms.serviceTitle')}</h2>
        <p>{t('terms.serviceText')}</p>

        <h2>{t('terms.accountsTitle')}</h2>
        <p>{t('terms.accountsText')}</p>

        <h2>{t('terms.contentTitle')}</h2>
        <p>{t('terms.contentText')}</p>

        <h2>{t('terms.facebookTitle')}</h2>
        <p>{t('terms.facebookText')}</p>

        <h2>{t('terms.disclaimerTitle')}</h2>
        <p>{t('terms.disclaimerText')}</p>

        <h2>{t('terms.limitationTitle')}</h2>
        <p>{t('terms.limitationText')}</p>

        <h2>{t('terms.changesTitle')}</h2>
        <p>{t('terms.changesText')}</p>

        <h2>{t('terms.contactTitle')}</h2>
        <p>{t('terms.contactText')}</p>
      </div>
    </div>
  );
}
