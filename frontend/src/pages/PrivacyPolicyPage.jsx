import { useTranslation } from 'react-i18next';

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 800 }}>
        <h1>{t('privacy.title')}</h1>
        <p className="text-secondary mb-2">{t('privacy.lastUpdated')}</p>

        <h2>{t('privacy.introTitle')}</h2>
        <p>{t('privacy.introText')}</p>

        <h2>{t('privacy.dataCollectedTitle')}</h2>
        <ul>
          <li>{t('privacy.dataCollected1')}</li>
          <li>{t('privacy.dataCollected2')}</li>
          <li>{t('privacy.dataCollected3')}</li>
          <li>{t('privacy.dataCollected4')}</li>
        </ul>

        <h2>{t('privacy.facebookDataTitle')}</h2>
        <p>{t('privacy.facebookDataIntro')}</p>
        <ul>
          <li>{t('privacy.facebookData1')}</li>
          <li>{t('privacy.facebookData2')}</li>
          <li>{t('privacy.facebookData3')}</li>
        </ul>
        <p>{t('privacy.facebookDataStorage')}</p>

        <h2>{t('privacy.howWeUseTitle')}</h2>
        <ul>
          <li>{t('privacy.howWeUse1')}</li>
          <li>{t('privacy.howWeUse2')}</li>
          <li>{t('privacy.howWeUse3')}</li>
        </ul>

        <h2>{t('privacy.dataSharingTitle')}</h2>
        <p>{t('privacy.dataSharingText')}</p>

        <h2>{t('privacy.dataRetentionTitle')}</h2>
        <p>{t('privacy.dataRetentionText')}</p>

        <h2>{t('privacy.deletionTitle')}</h2>
        <p>{t('privacy.deletionText')}</p>

        <h2>{t('privacy.contactTitle')}</h2>
        <p>{t('privacy.contactText')}</p>
      </div>
    </div>
  );
}
