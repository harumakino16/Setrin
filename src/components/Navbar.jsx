import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

const Navbar = () => {
  const { currentUser, isAdmin } = useContext(AuthContext);

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/">ホーム</Link>
        </li>
        {isAdmin && (
          <li>
            <Link href="/admin/dashboard">管理者ダッシュボード</Link>
          </li>
        )}
        {/* 他のナビゲーション項目 */}
      </ul>
    </nav>
  );
};

export default Navbar; 