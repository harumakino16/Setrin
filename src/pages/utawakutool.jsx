import Layout from '@/pages/layout';
import H1 from '@/components/ui/h1';
import { FaMusic, FaRandom, FaRobot, FaCrown, FaArrowRight, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuthContext } from '@/context/AuthContext';
import { handleUpgradePlan } from '@/utils/stripeUtils';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Modal from '@/components/Modal';
import Price from '@/components/Price';

const PREMIUM_FEATURE_START_DATE = new Date('2025-01-01T00:00:00+09:00');

const ToolCard = ({ title, description, icon: Icon, href, color, isReady, isPremiumOnly, userIsPremium, onUpgradeClick }) => {
    const isAfterFeatureStartDate = useMemo(() => {
        return new Date() >= PREMIUM_FEATURE_START_DATE;
    }, []);

    const isDisabled = isReady || (isPremiumOnly && !userIsPremium && isAfterFeatureStartDate);
    const premiumMessage = isPremiumOnly && !userIsPremium && isAfterFeatureStartDate ? "プレミアム会員限定機能" : "準備中";

    const [isHovered, setIsHovered] = useState(false);

    // プレミアムユーザー向けのアクティブなツールカード
    if (isPremiumOnly && userIsPremium) {
        return (
            <Link 
                href={`/utawakutool/${href}`}
                className="relative bg-white border border-yellow-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-102 hover:shadow-xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* ヘッダー部分 */}
                <div className="bg-yellow-500 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon className="text-white text-2xl" />
                            <h2 className="text-white font-bold text-lg">
                                {title}
                            </h2>
                        </div>
                        <FaCrown className="text-white text-sm" />
                    </div>
                </div>

                {/* メインコンテンツ */}
                <div className="p-6">
                    <p className="text-gray-700 mb-4">{description}</p>
                   
                </div>
            </Link>
        );
    }

    // プレミアム機能の非アクティブカード（非プレミアムユーザー向け）
    if (isDisabled && premiumMessage === "プレミアム会員限定機能") {
        return (
            <div 
                className="relative bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-102"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* ヘッダー部分 */}
                <div className="bg-yellow-500 p-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <Icon className="text-white text-2xl mr-2" />
                        <h2 className="text-white font-bold">{title}</h2>
                    </div>
                    <FaCrown className="text-white text-xl" />
                </div>

                {/* メインコンテンツ */}
                <div className="p-6">
                    <div className="space-y-4">
                        <p className="text-gray-700">{description}</p>
                        <div className="space-y-2">
                            <div className="flex items-center text-gray-700">
                                <FaCheck className="text-green-500 mr-2" />
                                {href === 'request-utawaku' ? (
                                    <span>リスナーとの交流がもっと深まる</span>
                                ) : href === 'roulette-utawaku' ? (
                                    <span>ランダム選曲で配信にドキドキ感を</span>
                                ) : (
                                    <span>リスナーとのインタラクションが活発に</span>
                                )}
                            </div>
                            <div className="flex items-center text-gray-700">
                                <FaCheck className="text-green-500 mr-2" />
                                {href === 'request-utawaku' ? (
                                    <span>リクエスト管理でスムーズな進行</span>
                                ) : href === 'roulette-utawaku' ? (
                                    <span>配信を盛り上げる新しい演出として</span>
                                ) : (
                                    <span>配信を盛り上げる新しい演出として</span>
                                )}
                            </div>
                            <div className="flex items-center text-gray-700">
                                <FaCheck className="text-green-500 mr-2" />
                                <span>30日間無料でお試し可能</span>
                            </div>
                        </div>
                    </div>

                    {/* アクションボタン */}
                    <div className={`mt-6 transition-all duration-300 ${isHovered ? 'transform translate-y-0 opacity-100' : 'transform translate-y-2 opacity-90'}`}>
                        <button
                            onClick={onUpgradeClick}
                            className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            プレミアムで利用する
                            <FaArrowRight />
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            まずは30日間無料でお試し
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 通常のツールカード（AI歌枠など）
    return (
        <Link href={isDisabled ? '#' : `/utawakutool/${href}`} className={`relative flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm ${isDisabled ? 'pointer-events-none' : 'hover:bg-gray-100 transition-colors duration-200'}`}>
            <div className="flex items-center">
                <Icon className={`text-${color}-500 text-3xl mr-3`} />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-600">{description}</p>
                {isPremiumOnly && !isAfterFeatureStartDate && (
                    <p className="text-xs text-yellow-600 mt-1">※2025年2月1日からプレミアム会員限定機能となります</p>
                )}
            </div>
            {isDisabled && premiumMessage === "準備中" && (
                <div className="absolute inset-0 bg-gray-800 opacity-80 rounded-lg flex flex-col justify-center items-center p-4">
                    <div className="text-lg text-white">{premiumMessage}</div>
                </div>
            )}
        </Link>
    );
};

const UtawakuTool = () => {
    const { currentUser } = useAuthContext();
    const isPremiumUser = currentUser?.plan === 'premium';
    const [isLoading, setIsLoading] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const router = useRouter();

    const handleUpgradeClick = () => {
        if (!currentUser) {
            alert('ログインが必要です。');
            router.push('/');
            return;
        }
        setIsPriceModalOpen(true);
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4">
                <H1>歌枠ツール</H1>
                
                {!isPremiumUser && (
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg mb-8 mt-4 border border-yellow-200">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">🌟 プレミアム機能で歌枠配信をもっと楽しく！</h2>
                        <p className="text-gray-700 mb-4">
                            リクエスト機能やルーレット機能を使って、リスナーとの交流をより深めましょう。
                            30日間の無料トライアルで、すべての機能を体験できます。
                        </p>
                        <button
                            onClick={handleUpgradeClick}
                            disabled={isLoading}
                            className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "処理中..." : (
                                <>
                                    今すぐプレミアムを試す
                                    <FaArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <ToolCard
                        title="リクエスト歌枠"
                        description="公開リストにリクエストボタンが出現し、リスナーからのリクエストを受け付けることができます。"
                        icon={FaMusic}
                        color="green"
                        href="request-utawaku"
                        isReady={false}
                        isPremiumOnly={true}
                        userIsPremium={isPremiumUser}
                        onUpgradeClick={handleUpgradeClick}
                    />
                    <ToolCard
                        title="ルーレット歌枠"
                        description="公開リストの中からランダムに選ばれた曲を歌うルーレットツールです。"
                        icon={FaRandom}
                        color="purple"
                        href="roulette-utawaku"
                        isReady={false}
                        isPremiumOnly={true}
                        userIsPremium={isPremiumUser}
                        onUpgradeClick={handleUpgradeClick}
                    />
                    <ToolCard
                        title="AI歌枠"
                        description="3つの単語を与えると、その単語に関連する曲をAIが選曲します。"
                        icon={FaRobot}
                        color="blue"
                        href="ai-utawaku"
                        isReady={true}
                        isPremiumOnly={false}
                        userIsPremium={isPremiumUser}
                    />
                </div>
            </div>

            <Modal isOpen={isPriceModalOpen} onClose={() => setIsPriceModalOpen(false)}>
                <Price />
            </Modal>
        </Layout>
    )
}

export default UtawakuTool;

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}
