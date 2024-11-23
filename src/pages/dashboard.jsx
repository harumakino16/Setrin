import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Layout from '@/pages/Layout';
import { fetchUserData } from '@/utils/dashboardUtils'; // 追加

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid);
        setUserData(data);
      }
    };

    fetchData();
  }, [currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>; // またはログインページへのリダイレクト
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="p-5">
        <h1 className="text-3xl font-bold mb-4">ダッシュボード</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-semibold mb-2">曲の概要</h2>
            <p>総曲数: {userData.totalSongs}</p>
          </div>
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-semibold mb-2">タグ</h2>
            <ul>
              {Object.entries(userData.tags).map(([tag, count]) => (
                <li key={tag}>{tag} ({count})</li>
              ))}
            </ul>
          </div>
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-semibold mb-2">ジャンル</h2>
            <ul>
              {Object.entries(userData.genres).map(([genre, count]) => (
                <li key={genre}>{genre} ({count})</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;