import { useEffect, useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar'; // サイドバーをインポート

export default function SetlistHistory() {
  const [setlists, setSetlists] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchSetlists = async () => {
      if (currentUser) {
        const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
        const querySnapshot = await getDocs(setlistsRef);
        const setlistsData = await Promise.all(querySnapshot.docs.map(async doc => {
          const songsRef = collection(db, 'users', currentUser.uid, 'Setlists', doc.id, 'Songs');
          const songsSnapshot = await getDocs(songsRef);
          return { 
            id: doc.id, 
            ...doc.data(), 
            songCount: songsSnapshot.docs.length 
          };
        }));
        setSetlists(setlistsData);
      }
    };

    fetchSetlists();
  }, [currentUser]);

  return (
    <div className="flex">
      <Sidebar /> {/* サイドバーを表示 */}
      <div className="flex-grow">
        <h1 className="text-2xl font-bold mb-4">セットリスト履歴</h1>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                セットリスト名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                曲数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                詳細
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {setlists.map((setlist) => (
              <tr key={setlist.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {setlist.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {setlist.createdAt.toDate().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {setlist.songCount} 曲
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/setlisthistory/${setlist.id}`} className="text-indigo-600 hover:text-indigo-900">詳細を見る</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}

