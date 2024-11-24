import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useMessage } from '@/context/MessageContext';
import Layout from '@/pages/layout';
const DeleteUser = () => {
  const [userId, setUserId] = useState('');
  const { setMessageInfo } = useMessage();
  const auth = getAuth();

  const handleDelete = async () => {
    if (!userId) {
      setMessageInfo({ message: 'ユーザーIDを入力してください。', type: 'error' });
      return;
    }

    const token = await auth.currentUser.getIdToken();

    try {
      const response = await fetch('/api/admin/deleteUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageInfo({ message: data.message, type: 'success' });
      } else {
        setMessageInfo({ message: data.message, type: 'error' });
      }
    } catch (error) {
      setMessageInfo({ message: 'ユーザー削除に失敗しました。', type: 'error' });
    }
  };

  return (
    <Layout>
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">ユーザー削除</h2>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="削除するユーザーID"
          className="border p-2 rounded w-full mb-4"
        />
        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
          ユーザーを削除
        </button>
      </div>
    </Layout>
  );
};

export default DeleteUser; 