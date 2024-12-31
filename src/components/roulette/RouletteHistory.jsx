import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { db } from '@/../firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMessage } from '@/context/MessageContext';

export default function RouletteHistory() {
  const { currentUser } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setMessageInfo } = useMessage();

  useEffect(() => {
    if (!currentUser) return;

    const historyRef = collection(db, 'users', currentUser.uid, 'rouletteHistory');
    const q = query(historyRef, orderBy('decidedAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        decidedAt: doc.data().decidedAt?.toDate()
      }));
      setHistory(historyData);
      setLoading(false);
    }, (error) => {
      console.error('Failed to fetch roulette history:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (!window.confirm('この履歴を削除してもよろしいですか？')) return;

    try {
      const historyRef = doc(db, 'users', currentUser.uid, 'rouletteHistory', id);
      await deleteDoc(historyRef);
      setMessageInfo({ type: 'success', message: '履歴を削除しました' });
    } catch (error) {
      console.error('Failed to delete history:', error);
      setMessageInfo({ type: 'error', message: '履歴の削除に失敗しました' });
    }
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        まだ履歴がありません
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4">ルーレット履歴</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">曲名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アーティスト</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">セットリスト</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">削除</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{item.artist || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{item.setlistname || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {item.decidedAt?.toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                    title="削除"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 