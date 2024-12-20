import withAdminAuth from '@/components/withAdminAuth';
import { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link'; // 追加
import Layout from '@/pages/layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


const AdminDashboard = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [userCount, setUserCount] = useState(0); // ユーザー数の状態を追加

  const fetchRecentActivities = async () => {
    // 最近のアクティビティを取得するロジックを追加
  };

  const fetchUserCount = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      setUserCount(querySnapshot.size); // ユーザー数を設定
    } catch (error) {
      console.error("Error fetching user count: ", error);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
    fetchUserCount(); // ユーザー数を取得
  }, []);

  return (
    <Layout>
      <div className="p-5">
        <h1 className="text-3xl font-bold mb-4">管理者ダッシュボード</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-semibold mb-2">セットリストの概要</h2>
            <ul>

            </ul>
          </div>

          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-semibold mb-2">最近のアクティビティ</h2>
            <ul>
              {recentActivities.map(activity => (
                <li key={activity.id} className="border-b py-2">
                  {activity.description}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-semibold mb-2">統計情報</h2>
            <p>総セットリスト数: </p>
            <p>ユーザー数: {userCount}</p> {/* ユーザー数を表示 */}
            {/* 他の統計情報を追加 */}
          </div>
        </div>

        <div className="mt-4">
          <Link href="/admin/users">
            <p className="bg-blue-500 text-white px-4 py-2 rounded">ユーザー管理ページへ</p>
          </Link>
        </div>
        <div className="mt-4">
          <Link href="/admin/database_operation">
            <p className="bg-blue-500 text-white px-4 py-2 rounded">データベース操作ページへ</p>
          </Link>
        </div>
        <div className="mt-4">
          <Link href="/admin/test">
            <p className="bg-blue-500 text-white px-4 py-2 rounded">テストページへ</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default withAdminAuth(AdminDashboard); 

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}