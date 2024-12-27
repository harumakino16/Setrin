import { useState, useEffect } from 'react';
import { db } from '@/../firebaseConfig';
import { collection, getDocs, query, where, Timestamp, collectionGroup } from 'firebase/firestore';
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
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);

        const activeUsersPromises = querySnapshot.docs
          .map(async doc => {
            const userData = doc.data();
            const lastActivity = userData.userActivity?.lastActivityAt?.toDate();
            
            if (lastActivity && lastActivity > thirtyDaysAgo) {
              // ユーザーごとのSongsサブコレクションを取得
              const songsRef = collection(db, 'users', doc.id, 'Songs');
              const songsSnapshot = await getDocs(songsRef);
              const songCount = songsSnapshot.size;

              const rawTotalScore = (
                (userData.userActivity?.setlistCount || 0) * 2 +
                (userData.userActivity?.publicListCount || 0) * 2 +
                (userData.userActivity?.playlistCreationCount || 0) * 1 +
                (userData.userActivity?.randomSetlistCount || 0) * 1 +
                (userData.userActivity?.requestUtawakuCount || 0) * 3 +
                (userData.userActivity?.rouletteCount || 0) * 0.4
              );

              return {
                id: doc.id,
                email: userData.email || '不明',
                username: userData.displayName || '未設定',
                songCount: songCount,
                lastActivity: lastActivity,
                setlistCount: userData.userActivity?.setlistCount || 0,
                publicListCount: userData.userActivity?.publicListCount || 0,
                playlistCreationCount: userData.userActivity?.playlistCreationCount || 0,
                randomSetlistCount: userData.userActivity?.randomSetlistCount || 0,
                requestUtawakuCount: userData.userActivity?.requestUtawakuCount || 0,
                rouletteCount: userData.userActivity?.rouletteCount || 0,
                monthlyRandomSetlistCount: userData.userActivity?.monthlyRandomSetlistCount || 0,
                monthlyRequestUtawakuCount: userData.userActivity?.monthlyRequestUtawakuCount || 0,
                monthlyRouletteCount: userData.userActivity?.monthlyRouletteCount || 0,
                totalScore: Math.round(rawTotalScore * 10) / 10,
              };
            }
            return null;
          })
          .filter(Boolean);

        const activeUsers = await Promise.all(activeUsersPromises);
        const filteredActiveUsers = activeUsers.filter(user => user !== null);

        setUsers(sortData(filteredActiveUsers, sortConfig));
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
                <SortableHeader label="ユーザー名" sortKey="username" />
                <SortableHeader label="曲数" sortKey="songCount" />
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
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.songCount}</td>
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
