import React from 'react';
import Link from 'next/link';
import NoSidebarLayout from '@/pages/noSidebarLayout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextSeo } from 'next-seo';

const TermsOfUse = () => {
  const { t } = useTranslation('common');
  const seoData = {
    title: '利用規約 | Setlink - VTuberのための歌枠支援ツール',
    description: 'Setlinkの利用規約です。サービスの利用条件、ユーザーの権利と義務、禁止事項などについて定めています。',
    openGraph: {
      title: '利用規約 | Setlink',
      description: 'Setlinkの利用規約です。サービスの利用条件、ユーザーの権利と義務、禁止事項などについて定めています。',
      url: 'https://setlink.jp/termsuser',
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
      <NoSidebarLayout>
        <div className="p-5">
          <h1 className="text-3xl font-bold mb-4">利用規約</h1>
          <p className="mb-4">以下の利用規約（以下、「本規約」といいます。）は、本サービスの提供条件および当社とユーザーの権利義務関係を定めるものです。本サービスを利用する前に、必ず本規約をお読みください。</p>
          <h2 className="text-2xl font-bold mt-4">1. 適用</h2>
          <p className="mb-4">本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。</p>
          <h2 className="text-2xl font-bold mt-4">2. 利用登録</h2>
          <p className="mb-4">登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。</p>
          <h2 className="text-2xl font-bold mt-4">3. ユーザーIDおよびパスワードの管理</h2>
          <p className="mb-4">ユーザーは、自己の責任において、ユーザーIDおよびパスワードを適切に管理するものとします。</p>
          <h2 className="text-2xl font-bold mt-4">4. 禁止事項</h2>
          <p className="mb-4">ユーザーは、以下の行為をしてはならないものとします。</p>
          <ul className="list-disc pl-5 mb-4">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当社、本サービスの他のユーザー、またはその他第三者の権利を侵害する行為</li>
            <li>その他、当社が不適切と判断する行為</li>
          </ul>
          <h2 className="text-2xl font-bold mt-4">5. 免責事項</h2>
          <p className="mb-4">当社は、本サービスに関して、ユーザーに対し、その内容の正確性、完全性、有用性、特定目的への適合性、第三者の権利非侵害等について、明示または黙示を問わず、一切保証しません。</p>
          <h2 className="text-2xl font-bold mt-4">6. 契約の変更と終了</h2>
          <p className="mb-4">当社は、ユーザーに通知することなく、本サービスの内容を変更し、または本サービスの提供を終了することができます。</p>
          <h2 className="text-2xl font-bold mt-4">7. YouTubeの利用規約</h2>
          <p className="mb-4">ユーザーは、YouTubeの利用規約に従うものとします。詳細は<Link href="https://www.youtube.com/t/terms" className="text-blue-500 hover:text-blue-600">YouTubeの利用規約</Link>をご覧ください。</p>
          <h2 className="text-2xl font-bold mt-4">8. お問い合わせ</h2>
          <p className="mb-4">本規約に関するお問い合わせは、<Link href="/contact" className="text-blue-500 hover:text-blue-600">お問い合わせページ</Link>からお願い致します。</p>
        </div>
      </NoSidebarLayout>
    </>
  );
};

export default TermsOfUse;

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}