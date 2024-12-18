import withAdminAuth from '@/components/withAdminAuth';
import { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, getDocs, getCountFromServer, query, limit, startAfter } from 'firebase/firestore';
import { useMessage } from '@/context/MessageContext';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import Layout from '@/pages/layout';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortByTotalSongs, setSortByTotalSongs] = useState(false);
  const usersPerPage = 100;
  const { setMessageInfo } = useMessage();

  const [visibleColumns, setVisibleColumns] = useState({
    userId: true,
    email: true,
    displayName: true,
    totalSongs: true,
    createdAt: true,
    actions: true,
  });

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

  const fetchAllUsers = async () => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const userData = doc.data();
        const songsCollection = collection(db, 'users', doc.id, 'Songs');
        const songsSnapshot = await getCountFromServer(songsCollection);
        const totalSongs = songsSnapshot.data().count;

        const createdAt = userData.createdAt ? userData.createdAt.toDate() : null;

        return { id: doc.id, ...userData, totalSongs, createdAt };
      })
    );

    setAllUsers(usersList);
  };

  const sortAndPaginateUsers = () => {
    let sortedUsers = [...allUsers];

    if (sortByTotalSongs) {
      sortedUsers.sort((a, b) => b.totalSongs - a.totalSongs);
    } else {
      sortedUsers.sort((a, b) => b.createdAt - a.createdAt);
    }

    const startIndex = (currentPage - 1) * usersPerPage;
    const paginatedUsers = sortedUsers.slice(startIndex, startIndex + usersPerPage);

    setUsers(paginatedUsers);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    sortAndPaginateUsers();
  }, [allUsers, currentPage, sortByTotalSongs]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const toggleSortByTotalSongs = () => {
    setSortByTotalSongs((prev) => !prev);
  };

  return (
    <Layout>
      <div className="p-5">
        <h1 className="text-3xl font-bold mb-4">ユーザー管理</h1>
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
        <button
          onClick={toggleSortByTotalSongs}
          className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
        >
          {sortByTotalSongs ? '登録日時順にソート' : '総曲数順にソート'}
        </button>
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
            {users.map((user) => (
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
            disabled={currentPage === 1}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            前のページ
          </button>
          <button
            onClick={handleNextPage}
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
