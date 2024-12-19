import Link from 'next/link';
import React from 'react';
import NoSidebarLayout from './noSidebarLayout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


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
                <td className="px-6 py-4">株式会社PXstudio</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>代表者</strong></td>
                <td className="px-6 py-4">林 孝洋</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>所在地</strong></td>
                <td className="px-6 py-4">東京都港区南青山2-2-15 WIN青山531</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>電話番号</strong></td>
                <td className="px-6 py-4">下記メールアドレスからご請求いただければ、弊社営業時間内において遅滞なく開示いたします。</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>メールアドレス</strong></td>
                <td className="px-6 py-4">support@pxstudio.site</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>利用料金</strong></td>
                <td className="px-6 py-4">プラン一覧ページに記載</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>利用料金以外にお客様に発生する料金等</strong></td>
                <td className="px-6 py-4">インターネット接続料金、通信料金等</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>支払い方法</strong></td>
                <td className="px-6 py-4">クレジットカード</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>支払い時期</strong></td>
                <td className="px-6 py-4">商品購入時に全額のご請求</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>商品の引渡時期</strong></td>
                <td className="px-6 py-4">当社所定の手続き終了後、直ちにご利用頂けます。</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>返品・交換について</strong></td>
                <td className="px-6 py-4">電子商品としての性質上、返品には応じられません。</td>
              </tr>
              <tr>
                <td className="px-6 py-4"><strong>解約について</strong></td>
                <td className="px-6 py-4">
                  ご解約のお手続きは、原則いつでも可能です。<br />
                  ただし、更新日の24時間前までに解約手続をご完了頂かないと自動更新される場合があります。<br />
                  また、予定されたご利用期間の途中において解約手続を行った場合でも、お支払い済みの料金は返金されません（日割計算による返金もいたしかねます）。<br />
                  ご解約の効力は、利用期間満了時に発生するものとします。<br />
                  ご解約は弊サービス内表記に従って行うことが可能です。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </NoSidebarLayout>
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