import { useState, useEffect } from 'react';
import { db } from '@/../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  getDoc,
  doc
} from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const KpiDashboard = ({ dateRange }) => {
  const [metrics, setMetrics] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [previousPeriodData, setPreviousPeriodData] = useState(null);
  const [monthlyGoals, setMonthlyGoals] = useState({
    newUsers: 100,
    mau: 500,
    paidUsers: 50,
    adConversionRate: 10
  });

  const getStartDate = (range) => {
    const now = new Date();
    switch (range) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const fetchMetrics = async () => {
    try {
      const metricsRef = collection(db, 'metrics');
      const startDate = getStartDate(dateRange);
      
      // 現在期間のデータ取得
      const currentQuery = query(
        metricsRef,
        where('date', '>=', startDate),
        orderBy('date', 'asc')
      );
      const currentSnap = await getDocs(currentQuery);
      const currentData = currentSnap.docs.map(doc => doc.data());
      setHistoricalData(currentData);

      // 前期間のデータ取得
      const previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);
      const previousQuery = query(
        metricsRef,
        where('date', '>=', previousStartDate),
        where('date', '<', startDate),
        orderBy('date', 'asc')
      );
      const previousSnap = await getDocs(previousQuery);
      const previousData = previousSnap.docs.map(doc => doc.data());
      setPreviousPeriodData(previousData);

      // 最新のメトリクスを設定
      if (currentData.length > 0) {
        setMetrics(currentData[currentData.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // 目標値を取得
  const fetchGoals = async () => {
    try {
      const goalsDoc = await getDoc(doc(db, 'settings', 'kpiGoals'));
      if (goalsDoc.exists()) {
        setMonthlyGoals(goalsDoc.data());
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchMetrics();
  }, [dateRange]);

  const calculateGrowthRate = (current, previous) => {
    if (!previous) return null;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const KpiCard = ({ title, value, subValue, color, previousValue, goal }) => {
    const growthRate = calculateGrowthRate(value, previousValue);
    const goalProgress = goal ? (value / goal * 100).toFixed(1) : null;

    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subValue && (
          <p className="text-sm text-gray-600 mt-1">{subValue}</p>
        )}
        {growthRate && (
          <p className={`text-sm mt-2 ${parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            前期比: {growthRate}%
          </p>
        )}
        {goalProgress && (
          <div className="mt-2">
            <div className="text-sm text-gray-600">目標達成率: {goalProgress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 rounded-full h-2"
                style={{ width: `${Math.min(100, goalProgress)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const prepareChartData = () => {
    if (!historicalData) return null;

    return {
      labels: historicalData.map(d => new Date(d.date.seconds * 1000).toLocaleDateString('ja-JP')),
      datasets: [
        {
          label: '新規登録者数',
          data: historicalData.map(d => d.newUsers),
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.1
        },
        {
          label: 'MAU',
          data: historicalData.map(d => d.mau),
          borderColor: 'rgb(139, 92, 246)',
          tension: 0.1
        },
        {
          label: '有料会員数',
          data: historicalData.map(d => d.paidUsers),
          borderColor: 'rgb(234, 179, 8)',
          tension: 0.1
        }
      ]
    };
  };

  const prepareSourceChartData = () => {
    if (!historicalData) return null;

    return {
      labels: historicalData.map(d => new Date(d.date.seconds * 1000).toLocaleDateString('ja-JP')),
      datasets: [
        {
          label: 'Twitter',
          data: historicalData.map(d => d.signUpSources?.twitter || 0),
          borderColor: 'rgb(29, 161, 242)',
          tension: 0.1
        },
        {
          label: 'Google',
          data: historicalData.map(d => d.signUpSources?.google || 0),
          borderColor: 'rgb(234, 67, 53)',
          tension: 0.1
        },
        {
          label: 'YouTube',
          data: historicalData.map(d => d.signUpSources?.youtube || 0),
          borderColor: 'rgb(255, 0, 0)',
          tension: 0.1
        },
        {
          label: '直接アクセス',
          data: historicalData.map(d => d.signUpSources?.direct || 0),
          borderColor: 'rgb(107, 114, 128)',
          tension: 0.1
        }
      ]
    };
  };

  const chartData = prepareChartData();
  const sourceChartData = prepareSourceChartData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="新規登録者数（当月）"
          value={metrics?.newUsers}
          color="border-blue-500"
          previousValue={previousPeriodData?.[0]?.newUsers}
          goal={monthlyGoals.newUsers}
        />
        <KpiCard
          title="広告からの新規登録率"
          value={`${((metrics?.adUsers / metrics?.newUsers) * 100).toFixed(1)}%`}
          subValue={`${metrics?.adUsers}人 / ${metrics?.newUsers}人`}
          color="border-green-500"
          previousValue={previousPeriodData?.[0]?.adUsers / previousPeriodData?.[0]?.newUsers * 100}
          goal={monthlyGoals.adConversionRate}
        />
        <KpiCard
          title="MAU"
          value={metrics?.mau}
          color="border-purple-500"
          previousValue={previousPeriodData?.[0]?.mau}
          goal={monthlyGoals.mau}
        />
        <KpiCard
          title="有料会員数"
          value={metrics?.paidUsers}
          color="border-yellow-500"
          previousValue={previousPeriodData?.[0]?.paidUsers}
          goal={monthlyGoals.paidUsers}
        />
        <KpiCard
          title="広告からの有料会員化率"
          value={`${metrics?.adConversionRate.toFixed(1)}%`}
          subValue={`${metrics?.adPaidUsers}人 / ${metrics?.adUsers}人`}
          color="border-red-500"
          previousValue={previousPeriodData?.[0]?.adConversionRate}
        />
      </div>

      {/* 登録ソース別の分析を追加 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">登録ソース分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Twitter</h4>
            <p className="text-2xl font-bold mt-1">{metrics?.signUpSources?.twitter || 0}</p>
            {previousPeriodData?.[0]?.signUpSources?.twitter && (
              <p className={`text-sm mt-1 ${
                (metrics?.signUpSources?.twitter - previousPeriodData[0].signUpSources.twitter) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
              }`}>
                前期比: {calculateGrowthRate(
                  metrics?.signUpSources?.twitter,
                  previousPeriodData[0].signUpSources.twitter
                )}%
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">Google</h4>
            <p className="text-2xl font-bold mt-1">{metrics?.signUpSources?.google || 0}</p>
            {previousPeriodData?.[0]?.signUpSources?.google && (
              <p className={`text-sm mt-1 ${
                (metrics?.signUpSources?.google - previousPeriodData[0].signUpSources.google) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
              }`}>
                前期比: {calculateGrowthRate(
                  metrics?.signUpSources?.google,
                  previousPeriodData[0].signUpSources.google
                )}%
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">YouTube</h4>
            <p className="text-2xl font-bold mt-1">{metrics?.signUpSources?.youtube || 0}</p>
            {previousPeriodData?.[0]?.signUpSources?.youtube && (
              <p className={`text-sm mt-1 ${
                (metrics?.signUpSources?.youtube - previousPeriodData[0].signUpSources.youtube) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
              }`}>
                前期比: {calculateGrowthRate(
                  metrics?.signUpSources?.youtube,
                  previousPeriodData[0].signUpSources.youtube
                )}%
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-600">直接アクセス</h4>
            <p className="text-2xl font-bold mt-1">{metrics?.signUpSources?.direct || 0}</p>
            {previousPeriodData?.[0]?.signUpSources?.direct && (
              <p className={`text-sm mt-1 ${
                (metrics?.signUpSources?.direct - previousPeriodData[0].signUpSources.direct) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
              }`}>
                前期比: {calculateGrowthRate(
                  metrics?.signUpSources?.direct,
                  previousPeriodData[0].signUpSources.direct
                )}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* メインKPIのトレンドグラフ */}
      {chartData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">主要KPIトレンド</h3>
          <div className="h-80">
            <Line data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                }
              }
            }} />
          </div>
        </div>
      )}

      {/* 登録ソース別のトレンドグラフ */}
      {sourceChartData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">登録ソース別トレンド</h3>
          <div className="h-80">
            <Line data={sourceChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                }
              }
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiDashboard; 