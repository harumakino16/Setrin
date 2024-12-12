import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { useRouter } from 'next/router';
import updateSongDates from '@/scripts/updateSongDates';

export default function Test() {
  const [userId, setUserId] = useState('');
  const [resultMessage, setResultMessage] = useState('待機中');
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();
  const { setMessageInfo } = useMessage();

  useEffect(() => {
    if (!currentUser || currentUser.email !== 'px.studio.2020@gmail.com') {
      setMessageInfo({ message: 'このページにアクセスする権限がありません。', type: 'error' });
      router.push('/');
    }
  }, [currentUser, router, setMessageInfo]);

  if (!currentUser || currentUser.email !== 'px.studio.2020@gmail.com') {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">テストページ</h1>

      <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} />

      <button onClick={async () => {
        try {
          await updateSongDates(userId);
          setResultMessage("更新完了");
        } catch (error) {
          setResultMessage(`エラーです`);
        }
      }}>テスト！</button>
      <div>{resultMessage}</div>

    </div>
  );
}
