import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Custom404() {
  const { t } = useTranslation('common');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">{t('404 - ページが見つかりません')}</h1>
      <p className="mt-4 text-gray-600">申し訳ありませんが、お探しのページは存在しません。</p>
      <a href="/" className="mt-6 text-blue-500 hover:underline">ホームに戻る</a>
    </div>
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