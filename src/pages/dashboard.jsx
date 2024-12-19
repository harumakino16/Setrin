// pages/dashboard.js

import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Layout from '@/pages/layout';
import { fetchUserData } from '@/utils/dashboardUtils';
import { faTags, faList, faDatabase } from '@fortawesome/free-solid-svg-icons';
import {
  FREE_PLAN_MAX_SONGS,
  FREE_PLAN_MAX_SETLISTS,
  FREE_PLAN_MAX_YOUTUBE_PLAYLISTS,
  FREE_PLAN_MAX_PUBLIC_PAGES,
  PREMIUM_PLAN_MAX_PUBLIC_PAGES
} from '@/constants';
import H1 from '@/components/ui/h1';
import DashboardCard from '@/components/DashboardCard';
import Skeleton from '@/components/Skeleton';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import StatBox from '@/components/StatBox';
import TagsChart from '@/components/TagsChart';
import Badge from '@/components/Badge'; // 追加（オプション）
import { useTheme } from '@/context/ThemeContext';
import Modal from '@/components/Modal';
import Price from '@/components/Price';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// カラージェネレーター関数（HSLを使用して色相を均等に分散）
const generateColors = (num) => {
  const colors = [];
  const step = 360 / num;
  for (let i = 0; i < num; i++) {
    const hue = i * step;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};

// generateHoverColors関数を追加
const generateHoverColors = (colors, alpha = 0.8) => {
  return colors.map(color => {
    return color.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
  });
};

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const data = await fetchUserData(currentUser.uid);
        setUserData(data);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (!currentUser || loading) {
    return (
      <Layout>
        <div className="p-5">
          <H1>ダッシュボード</H1>
          <div className="space-y-6">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        </div>
      </Layout>
    );
  }

  // ジャンルチャート用の色生成
  const genresLabels = userData.genres ? Object.keys(userData.genres) : [];
  const genresDataValues = userData.genres ? Object.values(userData.genres) : [];
  const numGenres = genresLabels.length;
  const genresDynamicColors = generateColors(numGenres);
  const genresHoverColors = generateHoverColors(genresDynamicColors, 0.7);

  const genresChartData = {
    labels: genresLabels,
    datasets: [
      {
        label: 'ジャンル別曲数',
        data: genresDataValues,
        backgroundColor: genresDynamicColors,
        hoverBackgroundColor: genresHoverColors,
      },
    ],
  };

  const genresChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4B5563', // Tailwindのtext-gray-700に相当
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#4B5563', // Tailwindのtext-gray-700に相当
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
      y: {
        ticks: {
          color: '#4B5563', // Tailwindのtext-gray-700に相当
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Layout>
      <div className="p-5">
        <H1>ダッシュボード</H1>



        <div className="space-y-6">
          {/* 容量カード */}
          <DashboardCard icon={faDatabase} title={`容量(${currentUser.plan === 'free' ? '無料プラン' : 'プレミアム'})`}>
            <div className="space-y-4">
              <StatBox
                label="曲数"
                value={userData.totalSongs ? userData.totalSongs : 0}
                limit={currentUser.plan === 'free' ? FREE_PLAN_MAX_SONGS: '制限なし'}
              />
              <StatBox
                label="セットリスト数"
                value={userData.totalSetlists ? userData.totalSetlists : 0}
                limit={currentUser.plan === 'free' ? FREE_PLAN_MAX_SETLISTS: '制限なし'}
              />
              <StatBox
                label="再生リスト作成回数"
                value={userData.playlistCreationCount ? userData.playlistCreationCount : 0}
                limit={currentUser.plan === 'free' ? FREE_PLAN_MAX_YOUTUBE_PLAYLISTS : '制限なし'}
              />
              <StatBox
                label="公開リスト数"
                value={userData.publicPagesCount ? userData.publicPagesCount : 0}
                limit={currentUser.plan === 'free' ? FREE_PLAN_MAX_PUBLIC_PAGES: PREMIUM_PLAN_MAX_PUBLIC_PAGES}
              />
              {currentUser.plan === 'premium' && (
                <div className={`p-2 mb-6 bg-customTheme-${theme}-secondary border border-customTheme-${theme}-primary rounded flex justify-between items-center`}>
                  <p className="text-gray-600 text-sm">プレミアムプランにアップグレードすると容量が大幅にアップします</p>
                  <button className={`px-4 py-2 bg-customTheme-${theme}-primary text-white rounded`} onClick={() => setIsModalOpen(true)}>アップグレード</button>
                </div>
              )}
            </div>
          </DashboardCard>

          {/* タグカード */}
          <DashboardCard icon={faTags} title="タグ">
            {userData.tags && Object.keys(userData.tags).length > 0 ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(userData.tags).map(([tag, count]) => (
                    <Badge key={tag} label={`${tag} (${count})`} />
                  ))}
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">タグ使用頻度</h3>
                  <TagsChart tags={userData.tags} />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-600 text-center">まだ登録されていません。</p>
              </div>
            )}
          </DashboardCard>

          {/* ジャンルカード */}
          <DashboardCard icon={faList} title="ジャンル">
            {userData.genres && Object.keys(userData.genres).length > 0 ? (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(userData.genres).map(([genre, count]) => (
                    <Badge key={genre} label={`${genre} (${count})`} />
                  ))}
                </div>
                <div className="mt-6">
                  <Bar data={genresChartData} options={genresChartOptions} />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-600 text-center">まだ登録されていません。</p>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Price />
      </Modal>
    </Layout>


  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default Dashboard;
