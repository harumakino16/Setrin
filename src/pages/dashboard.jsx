import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Layout from '@/pages/Layout';
import { fetchUserData } from '@/utils/dashboardUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faTags, faList } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/context/ThemeContext';
import { FREE_PLAN_LIMIT } from '@/constants';

// カードコンポーネント
const DashboardCard = ({ icon, title, value, limit, children }) => {
    const { theme } = useTheme();
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={icon} className={`text-2xl text-customTheme-${theme}-primary mr-2`} />
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <p className="text-3xl font-bold mb-2">{value}{limit ? ` / ${limit}` : ''}</p>
            {children}
        </div>
    );
};

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
                    <DashboardCard
                        icon={faMusic}
                        title="総曲数"
                        value={userData.totalSongs}
                        limit={currentUser.plan === 'free' ? FREE_PLAN_LIMIT : '制限なし'}
                    />
                    <DashboardCard icon={faTags} title="タグ">
                        <ul className="mt-2">
                            {Object.entries(userData.tags).map(([tag, count]) => (
                                <li key={tag} className="text-gray-600">{tag} ({count})</li>
                            ))}
                        </ul>
                    </DashboardCard>
                    <DashboardCard icon={faList} title="ジャンル">
                        <ul className="mt-2">
                            {Object.entries(userData.genres).map(([genre, count]) => (
                                <li key={genre} className="text-gray-600">{genre} ({count})</li>
                            ))}
                        </ul>
                    </DashboardCard>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;