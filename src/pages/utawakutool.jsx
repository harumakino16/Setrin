import Layout from '@/pages/layout';
import H1 from '@/components/ui/h1';
import { FaMusic, FaRandom, FaRobot, FaCrown } from 'react-icons/fa';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useAuthContext } from '@/context/AuthContext';

const PREMIUM_FEATURE_START_DATE = new Date('2025-02-01T00:00:00+09:00');

const ToolCard = ({ title, description, icon: Icon, href, color, isReady, isPremiumOnly, userIsPremium }) => {
    const isAfterFeatureStartDate = useMemo(() => {
        return new Date() >= PREMIUM_FEATURE_START_DATE;
    }, []);

    const isDisabled = isReady || (isPremiumOnly && !userIsPremium && isAfterFeatureStartDate);
    const premiumMessage = isPremiumOnly && !userIsPremium && isAfterFeatureStartDate ? "プレミアム会員限定機能" : "準備中";

    return (
        <Link href={isDisabled ? '#' : `/utawakutool/${href}`} className={`relative flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm ${isDisabled ? 'pointer-events-none' : 'hover:bg-gray-100 transition-colors duration-200'}`}>
            <div className="flex items-center">
                <Icon className={`text-${color}-500 text-3xl mr-3`} />
                {isPremiumOnly && isAfterFeatureStartDate && <FaCrown className="text-yellow-500 text-xl absolute top-2 right-2" />}
            </div>
            <div className="">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-600">{description}</p>
                {isPremiumOnly && !isAfterFeatureStartDate && (
                    <p className="text-xs text-yellow-600 mt-1">※2025年2月1日からプレミアム会員限定機能となります</p>
                )}
            </div>
            {isDisabled && (
                <div className="absolute flex justify-center items-center inset-0 bg-gray-800 opacity-70 rounded-lg">
                    <p className={`z-10 text-lg ${premiumMessage === "プレミアム会員限定機能" ? "text-yellow-400" : "text-white"}`}>{premiumMessage}</p>
                </div>
            )}
        </Link>
    );
};

const UtawakuTool = () => {
    const { currentUser } = useAuthContext();
    const isPremiumUser = currentUser?.plan === 'premium';

    return (
        <Layout>
            <H1>歌枠ツール</H1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <ToolCard
                    title="リクエスト歌枠"
                    description="公開リストにリクエストボタンが出現し、リスナーからのリクエストを受け付けることができます。"
                    icon={FaMusic}
                    color="green"
                    href="request-utawaku"
                    isReady={false}
                    isPremiumOnly={true}
                    userIsPremium={isPremiumUser}
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