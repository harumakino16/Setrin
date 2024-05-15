import { useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import SetlistNameModal from '@/components/setlistNameModal';
import { useRouter } from 'next/router';
import { doc, deleteDoc } from 'firebase/firestore';
import Modal from '@/components/modal';
import useSetlists from '@/hooks/fetchSetlists';
import { db } from '../../firebaseConfig';

export default function Setlist() {
  const { currentUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const { setlists, loading } = useSetlists();

  const router = useRouter();

  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);
  const handleOpenEditModal = (setlist) => {
    setSelectedSetlist(setlist);
    setIsEditOpen(true);
  };
  const handleCloseEditModal = () => setIsEditOpen(false);

  const handleDeleteSetlist = async () => {
    if (selectedSetlist) {
      const setlistRef = doc(db, 'users', currentUser.uid, 'Setlists', selectedSetlist.id);
      await deleteDoc(setlistRef);
      setIsEditOpen(false);
    }
  };

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
                    <button onClick={(e) => { e.stopPropagation(); setSelectedSetlist(setlist); setIsEditOpen(true); }} className="text-red-500 hover:text-red-700">
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isOpen && <SetlistNameModal isOpen={isOpen} onClose={handleCloseModal} />}
      {isEditOpen && (
        <Modal isOpen={isEditOpen} onClose={handleCloseEditModal}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">セットリストを削除しますか？</h2>
            <div className="flex justify-end mt-4">
              <button onClick={handleDeleteSetlist} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2">
                削除
              </button>
              <button onClick={handleCloseEditModal} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                キャンセル
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
