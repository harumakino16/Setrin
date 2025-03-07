import { Check, X } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { handleUpgradePlan } from '@/utils/stripeUtils';
import { useRouter } from 'next/router';
import { FREE_PLAN_MAX_SONGS, FREE_PLAN_MAX_YOUTUBE_PLAYLISTS, FREE_PLAN_MAX_SETLISTS, PREMIUM_PLAN_PRICE, FREE_PLAN_MAX_PUBLIC_PAGES, PREMIUM_PLAN_MAX_PUBLIC_PAGES } from '@/constants';
import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'next-i18next';

function Price() {
  const { currentUser } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('common');

  // クエリパラメータを取得
  const { utm_source, utm_medium, utm_campaign, utm_content } = router.query;

  // ログインリンク用のクエリ文字列を生成
  const loginQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (utm_source) params.set('utm_source', utm_source);
    if (utm_medium) params.set('utm_medium', utm_medium);
    if (utm_campaign) params.set('utm_campaign', utm_campaign);
    if (utm_content) params.set('utm_content', utm_content);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [utm_source, utm_medium, utm_campaign, utm_content]);

  const isPremiumUser = currentUser?.plan === 'premium';
  const isTrialing = currentUser?.isTrialing;
  const premiumButtonText = currentUser ? 
    (isPremiumUser ? 
      (isTrialing ? t('freeTrialInProgress') : t('currentlyUsing')) 
      : currentUser.hasUsedTrial ? t('upgradeToPremiumPlan') : t('upgradeToPremiumPlanWithFreeTrial')) 
    : t('startWithPremiumPlanWithFreeTrial');
  const freeButtonText = currentUser?.plan === 'free' ? t('currentlyUsing') : t('startForFree');

  const handleUpgradePlanClick = () => {
    if (currentUser) {
      setIsLoading(true);
      handleUpgradePlan(currentUser).finally(() => setIsLoading(false));
    } else {
      alert(t('loginRequired'));
      router.push('/');
    }
  };

  const handleFreeButtonClick = () => {
    router.push(`/login${loginQuery}`);
  };

  // プレミアムプランボタンクリック時の処理
  const handlePremiumClick = async () => {
    setIsLoading(true);
    try {
      await handleUpgradePlan(currentUser, router);
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#bbe0ff] to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-600 mb-4">{t('simplePricingPlans')}</h1>
          <p className="text-lg text-gray-600">{t('twoPlansToChooseFrom')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PlanCard
            title={t('freePlan')}
            price="¥0"
            period={t('perMonth')}
            features={[
              { text: t('maxSongsRegistration', { count: FREE_PLAN_MAX_SONGS.toLocaleString() }), available: true },
              { text: t('unlimitedAutoSetlistCreation'), available: true },
              { text: t('publicListsCount', { count: FREE_PLAN_MAX_PUBLIC_PAGES }), available: true },
              { text: t('playlistCreationLimit', { count: FREE_PLAN_MAX_YOUTUBE_PLAYLISTS }), available: true },
              { text: t('setlistsLimit', { count: FREE_PLAN_MAX_SETLISTS }), available: true },
            ]}
            buttonText={freeButtonText}
            bannerText={t('startHere')}
            bannerColor="bg-gray-200"
            buttonColor="bg-[#bbe0ff]"
            buttonHoverColor="hover:bg-[#a5d4ff]"
            disabled={currentUser?.plan === 'free'}
            link={currentUser?.plan === 'free' ? null : `/login${loginQuery}`}
            onClick={currentUser?.plan === 'free' ? null : handleFreeButtonClick}
          />

          <PlanCard
            title={t('premiumPlan')}
            price={`¥${PREMIUM_PLAN_PRICE.toLocaleString()}`}
            period={t('perMonth')}
            features={[
              { text: t('allFeaturesOfFreePlan'), available: true, highlight: true },
              { text: t('unlimitedSongsRegistration'), available: true, highlight: true },
              { text: t('publicListsCount', { count: PREMIUM_PLAN_MAX_PUBLIC_PAGES }), available: true, highlight: true },
              { text: t('unlimitedPlaylistCreation'), available: true, highlight: true },
              { text: t('unlimitedSetlists'), available: true, highlight: true },
              { text: t('allSingingToolsAvailable'), available: true, highlight: true },
            ]}
            buttonText={premiumButtonText}
            bannerText={t('recommendedForStreamers')}
            bannerColor="bg-[#202938]"
            buttonColor="bg-gray-900"
            buttonHoverColor="hover:bg-gray-800"
            textColor="text-white"
            disabled={isPremiumUser}
            link={null}
            onClick={handlePremiumClick}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>{t('allPlansCancelAnytime')}</p>
          <p className="mt-2">{t('contactUsForQuestions')}</p>
        </div>
      </div>
    </div>
  );
}

Price.displayName = 'Price';

function PlanCard({ title, price, period, features, buttonText, bannerText, bannerColor, buttonColor, buttonHoverColor, textColor = "text-gray-600", disabled = false, link = null, onClick = null, isLoading = false }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 flex flex-col justify-between">
      <div>
        <div className={`${bannerColor} py-2`}>
          <p className={`text-center ${textColor} font-semibold`}>{bannerText}</p>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">{title}</h2>
          <p className="text-4xl font-bold text-gray-600 mb-6">{price}<span className="text-lg font-normal text-gray-600">{period}</span></p>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <Feature key={index} available={feature.available} text={feature.text} highlight={feature.highlight} />
            ))}
          </div>
        </div>
      </div>
      <div className="p-8 bg-gray-50">
        {link ? (
          <Link href={link} className={`block w-full text-center py-3 px-6 rounded-lg ${buttonColor} text-white font-semibold ${buttonHoverColor} transition-colors`}>
            {buttonText}
          </Link>
        ) : (
          <button
            className={`w-full py-3 px-6 rounded-lg ${buttonColor} text-white font-semibold ${buttonHoverColor} transition-colors ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled || isLoading}
            onClick={onClick}
          >
            {isLoading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

function Feature({ available, text, highlight = false }) {
  return (
    <div className="flex items-center space-x-3">
      {available ? (
        <Check className={`w-5 h-5 ${highlight ? 'text-blue-600' : 'text-green-500'}`} />
      ) : (
        <X className="w-5 h-5 text-gray-400" />
      )}
      <span className={`${highlight ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{text}</span>
    </div>
  );
}

export default Price;