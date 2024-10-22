import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { useRouter } from 'next/router';

export default function Test() {
  const { currentUser } = useContext(AuthContext);
  const { setMessageInfo } = useMessage();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.email !== 'px.studio.2020@gmail.com') {
      router.push('/');
    }
  }, [currentUser, router]);

  const updateAllSongDates = async () => {
    if (currentUser) {
      setLoading(true);
      try {
        const response = await fetch('/api/updateSongDates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUser.uid }),
        });

        if (response.ok) {
          setMessageInfo({ message: '全ての曲のデータが更新されました。', type: 'success' });
        } else {
          throw new Error('Failed to update song dates');
        }
      } catch (error) {
        setMessageInfo({ message: '曲のデータの更新に失敗しました。', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!currentUser || currentUser.email !== 'px.studio.2020@gmail.com') {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">テストページ</h1>
      <button
        onClick={updateAllSongDates}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? '更新中...' : '全ての曲のデータを更新'}
      </button>
    </div>
  );
}
