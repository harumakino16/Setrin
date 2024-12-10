import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Layout from '@/pages/layout';
import { useTheme } from '@/context/ThemeContext';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { db } from '@/../firebaseConfig';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

function RequestSession() {
  const [requests, setRequests] = useState([
    { id: 1, song: 'Song A', artist: 'Artist A', requester: 'User A', confirmed: false },
    { id: 2, song: 'Song B', artist: 'Artist B', requester: 'User B', confirmed: false },
    { id: 3, song: 'Song C', artist: 'Artist C', requester: 'User C', confirmed: false },
  ]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { currentUser } = useContext(AuthContext); // 現在のユーザーを取得
  const { theme } = useTheme();


  if (!currentUser) return;

  useEffect(() => {
    const fetchSessionStatus = async () => {
      const sessionRef = doc(db, 'users', currentUser.uid, 'requestSession', 'settings');
      let sessionDoc = await getDoc(sessionRef);
      if (!sessionDoc.exists()) {
        await setDoc(sessionRef, { requestSession: false });
        sessionDoc = await getDoc(sessionRef); // ドキュメントを再取得
      }
      setIsSessionActive(sessionDoc.data().requestSession);
    };
    fetchSessionStatus();
  }, [currentUser]);

  const toggleSessionActive = async () => {

    if (currentUser) {
      const sessionRef = doc(db, 'users', currentUser.uid, 'requestSession', 'settings');
      const sessionDoc = await getDoc(sessionRef);
      const newSessionStatus = !sessionDoc.data().requestSession;
      try {
        await updateDoc(sessionRef, { requestSession: newSessionStatus });
        setIsSessionActive(newSessionStatus);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };


  const toggleConfirmed = (id) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, confirmed: !request.confirmed } : request
      )
    );
  };

  return (
    <Layout>
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">リクエスト歌枠</h1>
      <div className="mb-4">
        <ToggleSwitch
          isOn={isSessionActive}
          onToggle={toggleSessionActive}
          onText="受付中"
          offText="停止中"
        />
      </div>
      <table className="w-3/4 mx-auto bg-white shadow-lg rounded-lg">
        <thead>
          <tr className={`bg-customTheme-${theme}-primary text-white`}>
            <th className="py-2">曲名</th>
            <th className="py-2">アーティスト名</th>
            <th className="py-2">リクエスト送信者</th>
            <th className="py-2">確認</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="border px-4 py-2">{request.song}</td>
              <td className="border px-4 py-2">{request.artist}</td>
              <td className="border px-4 py-2">{request.requester}</td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={request.confirmed}
                  onChange={() => toggleConfirmed(request.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

export default RequestSession; 