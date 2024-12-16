// components/StartRequestModeCTA.jsx

import Link from 'next/link';

export default function StartRequestModeCTA({ publicURL }) {
  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg flex flex-col items-center space-y-4">
    <h4 className="text-lg font-bold text-blue-700">リクエスト歌枠モードを始めましょう</h4>
    <p className="text-gray-700 text-center text-sm max-w-md">
      リクエスト歌枠モードが有効になりました。  
      下のボタンをクリックするとリクエスト歌枠管理ページへ移動できます。
      そこで実際にリスナーからのリクエストを監視・消化した後、受付を停止することができます。
    </p>
    <Link href="/utawakutool/request-utawaku" legacyBehavior>
      <a className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded shadow hover:bg-blue-700 transition-colors">
        リクエスト歌枠モードをはじめる
      </a>
    </Link>
  </div>
  );
}
