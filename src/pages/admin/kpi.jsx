import withAdminAuth from '@/components/withAdminAuth';
import { useState } from 'react';
import Layout from '@/pages/layout';
import KpiDashboard from '@/components/admin/KpiDashboard';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
  CalendarIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const KpiAnalytics = () => {
  const [dateRange, setDateRange] = useState('month'); // month, quarter, year
  const { t } = useTranslation('common');

  const handleRefresh = () => {
    // KPIデータの再取得処理
    window.location.reload();
  };

  const handleExport = () => {
    // CSVエクスポート機能の実装（必要に応じて）
    alert('エクスポート機能は準備中です');
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">KPI分析</h1>
            <p className="text-gray-600 mt-2">
              主要なパフォーマンス指標の分析と推移を確認できます
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* 期間選択 */}
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-blue-500"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="month">今月</option>
                <option value="quarter">過去3ヶ月</option>
                <option value="year">過去1年</option>
              </select>
              <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>

            {/* 更新ボタン */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-5 w-5" />
              更新
            </button>

            {/* エクスポートボタン */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              エクスポート
            </button>

            {/* 目標値設定へのリンクを追加 */}
            <Link
              href="/admin/kpi_goals"
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-50"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              目標値設定
            </Link>
          </div>
        </div>

        {/* KPIダッシュボード */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <KpiDashboard dateRange={dateRange} />
        </div>

        {/* 補足情報やグラフなど */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">注目ポイント</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 新規登録者の獲得チャネル分析</li>
              <li>• 有料会員化までの平均日数</li>
              <li>• アクティブユーザーの利用頻度</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">改善提案</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• 広告効果の最適化</li>
              <li>• ユーザーエンゲージメントの向上</li>
              <li>• 有料会員への転換率改善</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAdminAuth(KpiAnalytics);

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
} 