import withAdminAuth from '@/components/withAdminAuth';
import { useEffect, useState } from 'react';
import { db } from '@/../../firebaseConfig';
import { collection, getDocs, getCountFromServer, query, limit, startAfter, orderBy, where } from 'firebase/firestore';
import { useMessage } from '@/context/MessageContext';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import Layout from '@/pages/layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';



const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [displayUsers, setDisplayUsers] = useState([]);
  const [page, setPage] = useState(1);
  const usersPerPage = 50;
  const [searchUserId, setSearchUserId] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    userId: true,
    email: true,
    displayName: true,
    totalSongs: true,
    createdAt: true,
    actions: true,
  });

  const { setMessageInfo } = useMessage();

  const handleColumnChange = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const handleLoginAsUser = async (userId) => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const response = await fetch('/api/admin/loginAsUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to log in as user.');
      }

      const { token: customToken } = responseData;
      await signInWithCustomToken(auth, customToken);

      setMessageInfo({ message: 'ユーザーとしてログインしました。', type: 'success' });
    } catch (error) {
      console.error('Error logging in as user:', error);
      setMessageInfo({ message: 'ユーザーとしてのログインに失敗しました。', type: 'error' });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        setLoading(false);
        return;
      }

      const basicUsersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        totalSongs: 0,
        createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null
      }));

      setUsers(basicUsersList);
      
      const batchSize = 10;
      for (let i = 0; i < usersSnapshot.docs.length; i += batchSize) {
        const batch = usersSnapshot.docs.slice(i, i + batchSize);
        const updatedUsers = await Promise.all(
          batch.map(async (doc) => {
            try {
              const songsCollection = collection(db, 'users', doc.id, 'Songs');
              const songsSnapshot = await getCountFromServer(songsCollection);
              return {
                id: doc.id,
                totalSongs: songsSnapshot.data().count
              };
            } catch (error) {
              console.error(`Error fetching songs count for user ${doc.id}:`, error);
              return {
                id: doc.id,
                totalSongs: 0
              };
            }
          })
        );

        setUsers(prevUsers => {
          const newUsers = [...prevUsers];
          updatedUsers.forEach(update => {
            const index = newUsers.findIndex(user => user.id === update.id);
            if (index !== -1) {
              newUsers[index] = { ...newUsers[index], totalSongs: update.totalSongs };
            }
          });
          return newUsers;
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('ユーザーデータの取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (users.length === 0) return;

    let sortedUsers = [...users];
    
    if (searchUserId) {
      sortedUsers = sortedUsers.filter(user => 
        user.id.toLowerCase().includes(searchUserId.toLowerCase())
      );
    }

    if (sortField === 'totalSongs') {
      sortedUsers.sort((a, b) => {
        return sortDirection === 'desc' ? 
          b.totalSongs - a.totalSongs : 
          a.totalSongs - b.totalSongs;
      });
    } else {
      sortedUsers.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return sortDirection === 'desc' ? 
          b.createdAt - a.createdAt : 
          a.createdAt - b.createdAt;
      });
    }

    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    setDisplayUsers(sortedUsers.slice(startIndex, endIndex));
  }, [users, sortField, sortDirection, page, searchUserId]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(1);
  };

  const handleNextPage = () => {
    setPage(prev => prev + 1);
  };

  const handlePreviousPage = () => {
    setPage(prev => Math.max(prev - 1, 1));
  };

  return (
    <Layout>
      <div className="p-5">
        <h1 className="text-3xl font-bold mb-4">ユーザー管理</h1>
        <div className="mb-4">
          <input
            type="text"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            placeholder="ユーザーIDで検索..."
            className="px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          {Object.keys(visibleColumns).map((column) => (
            <label key={column} className="mr-4">
              <input
                type="checkbox"
                checked={visibleColumns[column]}
                onChange={() => handleColumnChange(column)}
                className="mr-1"
              />
              {column === 'userId' && 'ユーザーID'}
              {column === 'email' && 'メールアドレス'}
              {column === 'displayName' && '表示名'}
              {column === 'totalSongs' && '総曲数'}
              {column === 'createdAt' && '登録日時'}
              {column === 'actions' && '操作'}
            </label>
          ))}
        </div>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => handleSort('createdAt')}
            className={`px-4 py-2 rounded ${
              sortField === 'createdAt' ? 'bg-blue-500' : 'bg-gray-500'
            } text-white`}
          >
            登録日時順 {sortField === 'createdAt' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('totalSongs')}
            className={`px-4 py-2 rounded ${
              sortField === 'totalSongs' ? 'bg-blue-500' : 'bg-gray-500'
            } text-white`}
          >
            総曲数順 {sortField === 'totalSongs' && (sortDirection === 'desc' ? '↓' : '↑')}
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading && <div className="text-gray-500 mb-4">読み込み中...</div>}
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {visibleColumns.userId && <th className="py-2">ユーザーID</th>}
              {visibleColumns.email && <th className="py-2">メールアドレス</th>}
              {visibleColumns.displayName && <th className="py-2">表示名</th>}
              {visibleColumns.totalSongs && <th className="py-2">総曲数</th>}
              {visibleColumns.createdAt && <th className="py-2">登録日時</th>}
              {visibleColumns.actions && <th className="py-2">操作</th>}
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user) => (
              <tr key={user.id}>
                {visibleColumns.userId && <td className="border px-4 py-2">{user.id}</td>}
                {visibleColumns.email && <td className="border px-4 py-2">{user.email}</td>}
                {visibleColumns.displayName && <td className="border px-4 py-2">{user.displayName}</td>}
                {visibleColumns.totalSongs && <td className="border px-4 py-2">{user.totalSongs}</td>}
                {visibleColumns.createdAt && (
                  <td className="border px-4 py-2">
                    {user.createdAt ? user.createdAt.toLocaleString() : 'N/A'}
                  </td>
                )}
                {visibleColumns.actions && (
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleLoginAsUser(user.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      このユーザーとしてログイン
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1 || loading}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            前のページ
          </button>
          <span className="px-4 py-2">
            ページ {page} / {Math.ceil(users.length / usersPerPage)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page >= Math.ceil(users.length / usersPerPage) || loading}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            次のページ
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default withAdminAuth(ManageUsers);

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}