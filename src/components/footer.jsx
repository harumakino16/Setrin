import Link from 'next/link';
import React from 'react';
Link
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-4">
      <p>© 2023 Setlink. All rights reserved.</p>
      <div className="mt-2">
        <Link href="/termsuser" className="text-white hover:underline mr-4">利用規約</Link>
        <Link href="/privacypolicy" className="text-white hover:underline">プライバシーポリシー</Link>
      </div>
    </footer>
  );
};

export default Footer;
