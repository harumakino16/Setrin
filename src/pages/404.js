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

// 静的パスを生成するための新しいメソッド
export async function getStaticPaths({ locales }) {
    return {
        paths: [], // 空の配列で、すべてのパスを動的に生成
        fallback: 'blocking' // サーバーサイドでページを生成
    };
}
