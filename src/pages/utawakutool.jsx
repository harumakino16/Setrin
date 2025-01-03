import Layout from '@/pages/layout';
import H1 from '@/components/ui/h1';
import { FaMusic, FaRandom, FaRobot } from 'react-icons/fa';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


const ToolCard = ({ title, description, icon: Icon, href, color, isReady }) => {
    return (
        <Link href={`/utawakutool/${href}`} className={`relative flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm ${isReady ? 'pointer-events-none' : 'hover:bg-gray-100 transition-colors duration-200'}`}>
            <Icon className={`text-${color}-500 text-3xl mr-3`} />
            <div className="">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
            {isReady ? (
                <div className="absolute flex justify-center items-center inset-0 bg-gray-800 opacity-70 rounded-lg">
                    <p className="z-10 text-lg text-white">準備中</p>
                </div>
            ) : null}
        </Link>
    );
};

const UtawakuTool = () => {
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
                />
                <ToolCard
                    title="ルーレット歌枠"
                    description="公開リストの中からランダムに選ばれた曲を歌うルーレットツールです。"
                    icon={FaRandom}
                    color="purple"
                    href="roulette-utawaku"
                    isReady={false}
                />
                <ToolCard
                    title="AI歌枠"
                    description="3つの単語を与えると、その単語に関連する曲をAIが選曲します。"
                    icon={FaRobot}
                    color="blue"
                    href="ai-utawaku"
                    isReady={true}
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