import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import Layout from '@/pages/layout';
import withAdminAuth from '@/components/withAdminAuth';

const KpiGoals = () => {
  const [goals, setGoals] = useState({
    newUsers: 100,
    mau: 500,
    paidUsers: 50,
    adConversionRate: 10
  });

  useEffect(() => {
    const fetchGoals = async () => {
      const goalsDoc = await getDoc(doc(db, 'settings', 'kpiGoals'));
      if (goalsDoc.exists()) {
        setGoals(goalsDoc.data());
      }
    };
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'settings', 'kpiGoals'), goals);
      alert('目標値を更新しました');
    } catch (error) {
      console.error('Error updating goals:', error);
      alert('目標値の更新に失敗しました');
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">KPI目標値設定</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                新規登録者数（月間）
              </label>
              <input
                type="number"
                value={goals.newUsers}
                onChange={(e) => setGoals({...goals, newUsers: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                MAU
              </label>
              <input
                type="number"
                value={goals.mau}
                onChange={(e) => setGoals({...goals, mau: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                有料会員数
              </label>
              <input
                type="number"
                value={goals.paidUsers}
                onChange={(e) => setGoals({...goals, paidUsers: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                広告からの有料会員化率（%）
              </label>
              <input
                type="number"
                value={goals.adConversionRate}
                onChange={(e) => setGoals({...goals, adConversionRate: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default withAdminAuth(KpiGoals); 