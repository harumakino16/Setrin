import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import SetlistNameModal from '@/components/setlistNameModal';
import EditSetlistNameModal from '@/components/EditSetlistNameModal';
import { useRouter } from 'next/router';
import { db } from '@/../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';


export default function Setlist() {
  const { currentUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const [setlists, setSetlists] = useState([]); // スナップショットによるセットリスト
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!currentUser) return;

    const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
    const unsubscribe = onSnapshot(setlistsRef, (snapshot) => {
      const updatedSetlists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : '不明' // 日付の変換
      }));
      setSetlists(updatedSetlists);
    });

    return () => unsubscribe(); // Clean up subscription
  }, [currentUser]);

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);
  const handleOpenEditModal = (setlist) => {
    setSelectedSetlist(setlist);
    setIsEditOpen(true);
  };
  const handleCloseEditModal = () => setIsEditOpen(false);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">セットリスト</h1>
          <button onClick={handleOpenModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新しいセットリストを追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  セットリスト名
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  作成日
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  曲数
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  編集
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {setlists.map((setlist) => (
                <tr className='hover:cursor-pointer hover:bg-gray-100 transition-all' key={setlist.id} onClick={() => router.push(`/setlist/${setlist.id}`)} >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {setlist.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {setlist.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {setlist.songIds ? setlist.songIds.length : 0} 曲
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(setlist); }} className="text-blue-500 hover:text-blue-700">
                      編集
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isOpen && <SetlistNameModal isOpen={isOpen} onClose={handleCloseModal} />}
      {isEditOpen && <EditSetlistNameModal setlist={selectedSetlist} isOpen={isEditOpen} onClose={handleCloseEditModal} />}
    </div>
  );
}

