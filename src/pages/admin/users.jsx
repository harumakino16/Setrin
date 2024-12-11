import withAdminAuth from '@/components/withAdminAuth';
import { useEffect, useState } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { useMessage } from '@/context/MessageContext';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import Layout from '@/pages/layout';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    const fetchUsers = async () => {
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

      usersList.sort((a, b) => b.createdAt - a.createdAt);

      setUsers(usersList);
    };

    fetchUsers();
  }, []);

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
      </div>
    </Layout>
  );
};

export default withAdminAuth(ManageUsers);
