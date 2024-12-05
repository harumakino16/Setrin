import { useEffect, useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';

import Layout from '@/pages/layout';

function RequestSession() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { currentUser } = useContext(AuthContext); // 現在のユーザーを取得

  useEffect(() => {
    if (!currentUser) return;

    // ユーザーのセッション一覧を取得
    const sessionsRef = collection(db, 'users', currentUser.uid, 'RequestSession');
    const unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
      const sessionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionData);

      // アクティブなセッションを設定
      const activeSession = sessionData.find(session => session.isActive);
      if (activeSession) {
        setCurrentSessionId(activeSession.id);
        setIsSessionActive(true);
      } else {
        setCurrentSessionId(null);
        setIsSessionActive(false);
      }
    });

    return () => unsubscribeSessions();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !currentSessionId) return;

    // 現在のセッションのリクエストを取得
    const requestsRef = collection(db, 'users', currentUser.uid, 'RequestSession', currentSessionId, 'requests');
    const unsubscribeRequests = onSnapshot(requestsRef, (snapshot) => {
      const requestData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestData);
    });

    return () => unsubscribeRequests();
  }, [currentUser, currentSessionId]);

  const createNewSession = async () => {
    if (!currentUser) return;

    // 既存のアクティブなセッションがあれば非アクティブ化
    const activeSessions = sessions.filter(session => session.isActive);
    activeSessions.forEach(async (session) => {
      const sessionRef = doc(db, 'users', currentUser.uid, 'RequestSession', session.id);
      await updateDoc(sessionRef, { isActive: false });
    });

    // 新しいセッションを作成し、アクティブ化
    const sessionsRef = collection(db, 'users', currentUser.uid, 'RequestSession');
    const newSessionRef = await addDoc(sessionsRef, {
      isActive: true,
      createdAt: new Date(),
      title: `歌枠 ${sessions.length + 1}`,
    });

    setCurrentSessionId(newSessionRef.id);
    setIsSessionActive(true);
  };

  const handleSessionToggle = async () => {
    if (!currentUser || !currentSessionId) return;

    const sessionRef = doc(db, 'users', currentUser.uid, 'RequestSession', currentSessionId);

    // 他のセッションを非アクティブ化
    if (!isSessionActive) {
      const activeSessions = sessions.filter(session => session.isActive);
      activeSessions.forEach(async (session) => {
        const otherSessionRef = doc(db, 'users', currentUser.uid, 'RequestSession', session.id);
        await updateDoc(otherSessionRef, { isActive: false });
      });
    }

    // 現在のセッションの状態を切り替え
    const newStatus = !isSessionActive;
    setIsSessionActive(newStatus);
    await updateDoc(sessionRef, { isActive: newStatus });
  };

  const handleDelete = async (id) => {
    if (!currentUser || !currentSessionId) return;

    try {
      const requestRef = doc(db, 'users', currentUser.uid, 'RequestSession', currentSessionId, 'requests', id);
      await deleteDoc(requestRef);
    } catch (error) {
      console.error('リクエストの削除中にエラーが発生しました:', error);
    }
  };

  return (
    <Layout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">リクエスト歌枠管理ページ</h1>
        <button
          onClick={createNewSession}
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          新規歌枠
        </button>

        {currentSessionId ? (
          <>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="sessionToggle"
                checked={isSessionActive}
                onChange={handleSessionToggle}
                className="mr-2"
              />
              <label htmlFor="sessionToggle" className="text-lg">
                歌枠実施中
              </label>
            </div>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">現在のリクエスト一覧</h2>
              <ul className="space-y-2">
                {requests.map(request => (
                  <li key={request.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                    <span>{request.requesterName}さんから「{request.songTitle}」のリクエスト</span>
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <p>アクティブな歌枠がありません。新規歌枠を作成してください。</p>
        )}

        {/* ここに過去のセッション一覧や他の機能を追加できます */}
      </div>
    </Layout>
  );
}

export default RequestSession; 