import Link from 'next/link';
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">プライバシー ポリシー</h1>
      <p className="mb-4">このプライバシー ポリシーは、Setlink(以下、「本サービス」といいます。)がユーザーの情報をどのように収集、使用、保護するかについて説明します。</p>
      <h2 className="text-2xl font-bold mt-4">1. 収集する情報</h2>
      <ul className="list-disc pl-5">
        <li><strong>個人情報:</strong> ユーザーが本サービスに登録する際に、メールアドレス、パスワード（暗号化保存）、表示名を収集します。</li>
        <li><strong>認証情報:</strong> Googleアカウントを通じてログインする場合、Googleからアクセストークンとリフレッシュトークンを収集します。</li>
        <li><strong>使用情報:</strong> ユーザーが本サービスを使用する際の行動や選択。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">2. 情報の使用</h2>
      <p className="mb-4">収集した情報は以下の目的で使用されます：</p>
      <ul className="list-disc pl-5">
        <li>ユーザー認証</li>
        <li>ユーザー設定の保存</li>
        <li>サービスの提供と改善</li>
        <li>コミュニケーション（問い合わせ対応など）</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">3. 情報の共有</h2>
      <ul className="list-disc pl-5">
        <li><strong>第三者との共有:</strong> 特定の情報は、ユーザーの同意を得た上で第三者サービス（例：Google YouTube API）と共有されます。</li>
        <li><strong>法的要求:</strong> 法的義務に基づき、情報を公開する必要がある場合があります。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">4. 情報の保護</h2>
      <ul className="list-disc pl-5">
        <li>セキュリティ対策：情報は安全に保管され、不正アクセスや情報漏洩から保護されます。</li>
        <li>アクセス制限：情報へのアクセスは限定されたスタッフのみに許可されています。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">5. ユーザーの権利</h2>
      <ul className="list-disc pl-5">
        <li>情報アクセス: ユーザーは自己の情報にアクセスし、これを確認する権利があります。</li>
        <li>情報修正: 不正確な情報は修正することができます。</li>
        <li>情報削除: ユーザーは自己の情報を削除する要求をすることができます。</li>
      </ul>
      <h2 className="text-2xl font-bold mt-4">6. プライバシー ポリシーの変更</h2>
      <p className="mb-4">本ポリシーは必要に応じて更新されることがあります。変更があった場合は、本サービス上で通知します。</p>
      <h2 className="text-2xl font-bold mt-4">7. お問い合わせ</h2>
      <p className="mb-4">プライバシー ポリシーに関するご質問や懸念がある場合は、<Link href="/contact" className="text-blue-500 hover:text-blue-600">お問い合わせページ</Link>からご連絡ください。</p>
      <p className="mb-4">このプライバシー ポリシーは、ユーザーが安心して本サービスを利用できるよう努めています。</p>
    </div>
  );
};

export default PrivacyPolicy;
