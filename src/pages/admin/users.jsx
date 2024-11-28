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

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

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
          console.log('User ID:', doc.id);
          console.log('Total Songs:', totalSongs);
          return { id: doc.id, ...userData, totalSongs };
        })
      );
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  return (
    <Layout>
      <div className="p-5">
        <h1 className="text-3xl font-bold mb-4">ユーザー管理</h1>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">ユーザーID</th>
              <th className="py-2">メールアドレス</th>
              <th className="py-2">表示名</th>
              <th className="py-2">総曲数</th>
              <th className="py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{user.id}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.displayName}</td>
                <td className="border px-4 py-2">{user.totalSongs}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleLoginAsUser(user.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    このユーザーとしてログイン
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default withAdminAuth(ManageUsers);
