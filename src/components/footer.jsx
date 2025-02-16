import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4 text-sm">
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/lp" className="text-white hover:underline">Setlinkとは</Link>
        <Link href="/feedback" className="text-white hover:underline">バグ報告・機能提案</Link>
        <Link href="/termsuser" className="text-white hover:underline">利用規約</Link>
        <Link href="/tokusho" className="text-white hover:underline">特定商取引法に基づく表示</Link>
        <Link href="/privacypolicy" className="text-white hover:underline">プライバシーポリシー</Link>
        <Link href="https://www.youtube.com/t/terms" className="text-white hover:underline">YouTubeの利用規約</Link>
        <Link href="/contact" className="text-white hover:underline">お問い合わせ</Link>
      </div>
      <p className="mt-4">© 2024 Setlink. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
