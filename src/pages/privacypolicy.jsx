import Link from 'next/link';
import React from 'react';
import NoSidebarLayout from './noSidebarLayout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const PrivacyPolicy = () => {
  return (
    <NoSidebarLayout>
      <div className="p-5">
        <h1 className="text-3xl font-bold mb-4">プライバシー ポリシー</h1>
      <p className="mb-4">このプライバシー ポリシーは、Setlink(以下、「本サービス」といいます。)がユーザーの情報をどのように収集、使用、保護するかについて説明します。</p>
      <h2 className="text-2xl font-bold mt-4">1. 収集する情報</h2>
      <ul className="list-disc pl-5">
        <li><strong>個人情報:</strong> ユーザーが本サービスに登録する際に、メールアドレス、パスワード（暗号化保存）、表示名を収集します。</li>
        <li><strong>認証情報:</strong> Googleアカウントを通じてログインする場合、Googleからアクセストークンとリフレッシュトークンを収集します。</li>
        <li><strong>使用情報:</strong> ユーザーが本サービスを使用する際の行動や選択。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">2. 情報の保存、アクセス、収集に使用する技術</h2>
      <p className="mb-4">本サービスは、以下の技術を使用してユーザー情報を保存、アクセス、収集します：</p>
      <ul className="list-disc pl-5">
        <li><strong>Firebase Firestore:</strong> ユーザー情報の保存とアクセスに使用します。</li>
        <li><strong>Google OAuth:</strong> 認証情報の収集に使用します。</li>
        <li><strong>クッキー:</strong> 認証情報の保存に使用します。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">3. 情報の使用</h2>
      <p className="mb-4">収集した情報は以下の目的で使用されます：</p>
      <ul className="list-disc pl-5">
        <li>ユーザー認証</li>
        <li>ユーザー設定の保存</li>
        <li>サービスの提供と改善</li>
        <li>コミュニケーション（問い合わせ対応など）</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">4. 情報の共有</h2>
      <ul className="list-disc pl-5">
        <li><strong>第三者との共有:</strong> 特定の情報は、ユーザーの同意を得た上で第三者サービス（例：Google YouTube API）と共有されます。</li>
        <li><strong>法的要求:</strong> 法的義務に基づき、情報を公開する必要がある場合があります。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">5. 情報の保護</h2>
      <ul className="list-disc pl-5">
        <li>セキュリティ対策：情報は安全に保管され、不正アクセスや情報漏洩から保護されます。</li>
        <li>アクセス制限：情報へのアクセスは限定されたスタッフのみに許可されています。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">10. データ削除手順およびアクセス権の取り消し方法</h2>
      <p className="mb-4">ユーザーは以下の手順で保存データの削除およびアクセス権の取り消しを行うことができます：</p>
      <ul className="list-disc pl-5">
        <li><strong>データ削除手順:</strong> ユーザーは設定ページからアカウントを削除することができます。アカウント削除後、保存されているすべてのデータが削除されます。</li>
        <li><strong>アクセス権の取り消し方法:</strong> ユーザーはGoogleのセキュリティ設定ページ（<Link href="https://security.google.com/settings" className="text-blue-500 hover:text-blue-600">https://security.google.com/settings</Link>）から本サービスへのアクセス権を取り消すことができます。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">6. ユーザーの権利</h2>
      <ul className="list-disc pl-5">
        <li>情報アクセス: ユーザーは自己の情報にアクセスし、これを確認する権利があります。</li>
        <li>情報修正: 不正確な情報は修正することができます。</li>
        <li>情報削除: ユーザーは自己の情報を削除する要求をすることができます。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">7. YouTube APIサービスの利用</h2>
      <p className="mb-4">本サービスは、YouTube APIサービスを利用しています。ユーザーは、YouTubeの利用規約に従うものとします。詳細は<Link href="https://www.youtube.com/t/terms" className="text-blue-500 hover:text-blue-600">YouTubeの利用規約</Link>をご覧ください。</p>
      <p className="mb-4">また、Googleのプライバシーポリシーについては、<Link href="http://www.google.com/policies/privacy" className="text-blue-500 hover:text-blue-600">Googleプライバシーポリシー</Link>をご覧ください。</p>
      <h2 className="text-2xl font-bold mt-4">8. プライバシー ポリシーの変更</h2>
      <p className="mb-4">本ポリシーは必要に応じて更新されることがあります。変更があった場合は、本サービス上で通知します。</p>
      <h2 className="text-2xl font-bold mt-4">9. お問い合わせ</h2>
      <p className="mb-4">プライバシー ポリシーに関するご質問や懸念がある場合は、<Link href="/contact" className="text-blue-500 hover:text-blue-600">お問い合わせページ</Link>からご連絡ください。</p>
      <p className="mb-4">このプライバシー ポリシーは、ユーザーが安心して本サービスを利用できるよう努めています。</p>
      </div>
    </NoSidebarLayout>
  );
};

export default PrivacyPolicy;

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}