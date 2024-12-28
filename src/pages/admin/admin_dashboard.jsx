import withAdminAuth from '@/components/withAdminAuth';
import { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, getDocs,getCountFromServer } from 'firebase/firestore';
import Link from 'next/link';
import Layout from '@/pages/layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  UsersIcon as UserGroupIcon,
  ChartBarIcon,
  CircleStackIcon as DatabaseIcon,
  UserIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const { t } = useTranslation('common');

  const fetchRecentActivities = async () => {
    // 最近のアクティビティを取得するロジック
  };

  const fetchUserCount = async () => {
    try {
      const querySnapshot = await getCountFromServer(collection(db, 'users'));
      setUserCount(querySnapshot.data().count);
    } catch (error) {
      console.error("Error fetching user count: ", error);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
    fetchUserCount();
  }, []);

  const adminMenuItems = [
  {
      title: 'アクティブユーザー',
      description: '現在アクティブなユーザーを確認します',
      icon: UserIcon,
      href: '/admin/active_user',
      color: 'bg-purple-500',
    },
    {
      title: 'ユーザー管理',
      description: 'ユーザーの追加、編集、削除を行います',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'データベース操作',
      description: 'データベースの管理と操作を行います',
      icon: DatabaseIcon,
      href: '/admin/database_operation',
      color: 'bg-green-500',
    },
    
    {
      title: 'テスト環境',
      description: '各種機能のテストを行います',
      icon: BeakerIcon,
      href: '/admin/test',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">管理者ダッシュボード</h1>
          <p className="text-gray-600 mt-2">システムの概要と主要な管理機能にアクセスできます</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">総ユーザー数</p>
                <h3 className="text-2xl font-bold">{userCount}</h3>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminMenuItems.map((item) => (
            <Link href={item.href} key={item.title}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <div className={`${item.color} inline-flex p-3 rounded-lg text-white mb-4`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">最近のアクティビティ</h2>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="border-b pb-4">
                <p className="text-gray-600">{activity.description}</p>
                <span className="text-sm text-gray-500">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAdminAuth(AdminDashboard);

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}