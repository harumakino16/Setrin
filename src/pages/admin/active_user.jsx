import { useState, useEffect } from 'react';
import { db } from '@/../firebaseConfig';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import withAdminAuth from '@/components/withAdminAuth';
import Layout from '@/pages/layout';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const ActiveUsers = () => {
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'desc' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        // 30日前のタイムスタンプを作成
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        const activeUsers = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(user => {
            const lastActivity = user.userActivity?.lastActivityAt?.toDate();
            return lastActivity && lastActivity > thirtyDaysAgo;
          })
          .map(user => ({
            id: user.id,
            email: user.email || '不明',
            lastActivity: user.userActivity?.lastActivityAt?.toDate() || null,
            setlistCount: user.userActivity?.setlistCount || 0,
            publicListCount: user.userActivity?.publicListCount || 0,
            playlistCreationCount: user.userActivity?.playlistCreationCount || 0,
            randomSetlistCount: user.userActivity?.randomSetlistCount || 0,
            requestUtawakuCount: user.userActivity?.requestUtawakuCount || 0,
            rouletteCount: user.userActivity?.rouletteCount || 0,
            monthlyRandomSetlistCount: user.userActivity?.monthlyRandomSetlistCount || 0,
            monthlyRequestUtawakuCount: user.userActivity?.monthlyRequestUtawakuCount || 0,
            monthlyRouletteCount: user.userActivity?.monthlyRouletteCount || 0,
            // 総合スコアを計算（重み付けは適宜調整）
            totalScore: (
              (user.userActivity?.setlistCount || 0) * 1 +
              (user.userActivity?.publicListCount || 0) * 2 +
              (user.userActivity?.playlistCreationCount || 0) * 1 +
              (user.userActivity?.randomSetlistCount || 0) * 1 +
              (user.userActivity?.requestUtawakuCount || 0) * 3 +
              (user.userActivity?.rouletteCount || 0) * 0.5
            )
          }));

        setUsers(sortData(activeUsers, sortConfig));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching active users:', error);
        setLoading(false);
      }
    };

    fetchActiveUsers();
  }, []);

  const sortData = (data, { key, direction }) => {
    return [...data].sort((a, b) => {
      if (a[key] === b[key]) return 0;
      if (direction === 'asc') {
        return a[key] < b[key] ? -1 : 1;
      } else {
        return a[key] > b[key] ? -1 : 1;
      }
    });
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSortConfig({ key, direction });
    setUsers(sortData(users, { key, direction }));
  };

  const SortableHeader = ({ label, sortKey }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
      <th
        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center space-x-1">
          <span>{label}</span>
          {isSorted && (
            <span className="text-xs">
              {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">アクティブユーザー一覧</h1>
        <p className="mb-4 text-gray-600">
          過去30日以内にアクティビティのあるユーザー: {users.length}人
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Rank</th>
                <SortableHeader label="Email" sortKey="email" />
                <SortableHeader label="最終アクティビティ" sortKey="lastActivity" />
                <SortableHeader label="セットリスト数" sortKey="setlistCount" />
                <SortableHeader label="公開リスト数" sortKey="publicListCount" />
                <SortableHeader label="再生リスト作成数" sortKey="playlistCreationCount" />
                <SortableHeader label="ランダム作成数" sortKey="randomSetlistCount" />
                <SortableHeader label="リクエスト歌枠数" sortKey="requestUtawakuCount" />
                <SortableHeader label="ルーレット回数" sortKey="rouletteCount" />
                <SortableHeader label="総合スコア" sortKey="totalScore" />
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    {user.lastActivity?.toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </td>
                  <td className="px-4 py-2">{user.setlistCount}</td>
                  <td className="px-4 py-2">{user.publicListCount}</td>
                  <td className="px-4 py-2">{user.playlistCreationCount}</td>
                  <td className="px-4 py-2">{user.randomSetlistCount}</td>
                  <td className="px-4 py-2">{user.requestUtawakuCount}</td>
                  <td className="px-4 py-2">{user.rouletteCount}</td>
                  <td className="px-4 py-2 font-bold">{user.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default withAdminAuth(ActiveUsers);

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
