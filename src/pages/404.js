import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

export default function Custom404() {
  const { t } = useTranslation('common');
  const seoData = {
    title: 'ページが見つかりません | Setlink - VTuberのための歌枠支援ツール',
    description: 'お探しのページは存在しないか、移動または削除された可能性があります。',
    noindex: true,
    openGraph: {
      title: 'ページが見つかりません | Setlink',
      description: 'お探しのページは存在しないか、移動または削除された可能性があります。',
      url: 'https://setlink.jp/404',
      type: 'website',
      images: [
        {
          url: 'https://setlink.jp/images/bunner.png',
          width: 1200,
          height: 630,
          alt: 'Setlink',
        },
      ],
    },
  };

  return (
    <>
      <NextSeo {...seoData} />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-gray-800">{t('404 - ページが見つかりません')}</h1>
        <p className="mt-4 text-gray-600">申し訳ありませんが、お探しのページは存在しません。</p>
        <Link href="/" className="mt-6 text-blue-500 hover:underline">ホームに戻る</Link>
      </div>
    </>
  );
}

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}