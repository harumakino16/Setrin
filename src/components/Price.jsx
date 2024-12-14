import { Check, X } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { handleUpgradePlan } from '@/utils/stripeUtils';
import { useRouter } from 'next/router';
import { FREE_PLAN_MAX_SONGS, FREE_PLAN_MAX_YOUTUBE_PLAYLISTS, FREE_PLAN_MAX_SETLISTS, PREMIUM_PLAN_PRICE, FREE_PLAN_MAX_PUBLIC_PAGES, PREMIUM_PLAN_MAX_PUBLIC_PAGES } from '@/constants';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';


function Price() {
  const { currentUser } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isPremiumUser = currentUser?.plan === 'premium';
  const premiumButtonText = currentUser ? (isPremiumUser ? '現在利用中' : 'プレミアムプランに移行する') : 'プレミアムプランで始める';
  const freeButtonText = currentUser?.plan === 'free' ? '現在利用中' : '無料で始める';

  const handleUpgradePlanClick = () => {
    if (currentUser) {
      setIsLoading(true);
      handleUpgradePlan(currentUser).finally(() => setIsLoading(false));
    } else {
      alert('ログインが必要です。');
      router.push('/');
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#bbe0ff] to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-600 mb-4">シンプルな料金プラン</h1>
          <p className="text-lg text-gray-600">あなたのニーズに合わせて選べる2つのプラン</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PlanCard
            title="フリープラン"
            price="¥0"
            period="/月"
            features={[
              { text: `最大登録曲数${FREE_PLAN_MAX_SONGS.toLocaleString()}曲`, available: true },
              { text: `セトリ自動作成無制限`, available: true },
              { text: `公開リスト${FREE_PLAN_MAX_PUBLIC_PAGES}個`, available: true },
              { text: `再生リスト作成回数 ${FREE_PLAN_MAX_YOUTUBE_PLAYLISTS}回/月`, available: true },
              { text: `セットリスト数 ${FREE_PLAN_MAX_SETLISTS}個`, available: true },
              { text: "歌枠ツール利用不可", available: false },
            ]}
            buttonText={freeButtonText}
            bannerText="まずはここから！"
            bannerColor="bg-gray-200"
            buttonColor="bg-[#bbe0ff]"
            buttonHoverColor="hover:bg-[#a5d4ff]"
            disabled={currentUser?.plan === 'free'}
            link="/"
          />

          <PlanCard
            title="Premiumプラン"
            price={`¥${PREMIUM_PLAN_PRICE.toLocaleString()}`}
            period="/月"
            features={[
              { text: "無料プランの全ての機能", available: true, highlight: true },
              { text: "登録曲数無制限", available: true, highlight: true },
              { text: `公開リスト${PREMIUM_PLAN_MAX_PUBLIC_PAGES}個`, available: true, highlight: true },
              { text: "再生リスト作成回数 無制限", available: true, highlight: true },
              { text: "セットリスト数 無制限", available: true, highlight: true },
              { text: "歌枠ツール利用可能(準備中)", available: true, highlight: true },
            ]}
            buttonText={premiumButtonText}
            bannerText="歌枠配信者におすすめ！"
            bannerColor="bg-[#202938]"
            buttonColor="bg-gray-900"
            buttonHoverColor="hover:bg-gray-800"
            textColor="text-white"
            disabled={isPremiumUser}
            link={null}
            onClick={handleUpgradePlanClick}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>すべてのプランは、いつでもキャンセル可能です。</p>
          <p className="mt-2">ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        </div>
      </div>
    </div>
  );
}

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