import Link from 'next/link';
import React from 'react';
import NoSidebarLayout from './noSidebarLayout';

const TermsOfUse = () => {
  return (
    <NoSidebarLayout>
      <div className="p-5">
        <h1 className="text-3xl font-bold mb-4 text-center">特定商取引法に基づく表示</h1>
        <div className="overflow-x-auto">
          <table className="w-full mb-4 text-sm text-left text-gray-500 dark:text-gray-400">
            <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800">
              <tr>
                <td className="px-6 py-4"><strong>事業者名</strong></td>
                <td className="px-6 py-4">株式会社セットリンク</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>代表者</strong></td>
                <td className="px-6 py-4">山田 太郎</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>所在地</strong></td>
                <td className="px-6 py-4">東京都渋谷区○○町1-2-3</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>電話番号</strong></td>
                <td className="px-6 py-4">03-1234-5678</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>メールアドレス</strong></td>
                <td className="px-6 py-4">support@setlink.com</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>販売価格</strong></td>
                <td className="px-6 py-4">各商品の詳細ページに記載</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>商品以外の必要料金</strong></td>
                <td className="px-6 py-4">消費税、送料（地域により異なります）</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>支払い方法</strong></td>
                <td className="px-6 py-4">クレジットカード、銀行振込、PayPalなど</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>支払い時期</strong></td>
                <td className="px-6 py-4">商品購入時に全額のご請求</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>商品の引渡時期</strong></td>
                <td className="px-6 py-4">支払い確認後、速やかに発送</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>返品・交換について</strong></td>
                <td className="px-6 py-4">商品に欠陥がある場合を除き、返品・交換はお受けしておりません。詳細は<Link href="/contact" className="text-blue-500 hover:text-blue-600">お問い合わせページ</Link>までご連絡ください。</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>販売数量の制限</strong></td>
                <td className="px-6 py-4">特に制限はありません。</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>不良品について</strong></td>
                <td className="px-6 py-4">商品に不良があった場合は、ご連絡いただければ交換または返金いたします。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NoSidebarLayout>
  );
};

export default TermsOfUse;