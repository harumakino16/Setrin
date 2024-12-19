import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import SetlistNameModal from '@/components/setlistNameModal';
import { useRouter } from 'next/router';
import { doc, deleteDoc } from 'firebase/firestore';
import Modal from '@/components/Modal';
import useSetlists from '@/hooks/fetchSetlists';
import { db } from '../../firebaseConfig';
import Loading from '@/components/loading';
import { useTheme } from '@/context/ThemeContext';
import Layout from '@/pages/layout';
import H1 from '@/components/ui/h1';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Setlist() {
  const { currentUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const [selectedSetlists, setSelectedSetlists] = useState([]);
  const { setlists, loading } = useSetlists();
  const { theme } = useTheme();
  const router = useRouter();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { t } = useTranslation('common');

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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && isEditOpen) {
      handleDeleteSetlist();
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = setlists.map(setlist => setlist.id);
      setSelectedSetlists(allIds);
    } else {
      setSelectedSetlists([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedSetlists(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenDeleteConfirmModal = () => setIsDeleteConfirmOpen(true);
  const handleCloseDeleteConfirmModal = () => setIsDeleteConfirmOpen(false);

  const handleDeleteSelected = async () => {
    const deletePromises = selectedSetlists.map(id => {
      const setlistRef = doc(db, 'users', currentUser.uid, 'Setlists', id);
      return deleteDoc(setlistRef);
    });
    await Promise.all(deletePromises);
    setSelectedSetlists([]);
    setIsDeleteConfirmOpen(false);
    setIsEditOpen(false);
  };

  useEffect(() => {
    if (isEditOpen) {
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditOpen]);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row">
        <div className="flex-grow p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <H1>セットリスト</H1>
            <div>
              <button onClick={handleOpenModal} className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded inline-flex items-center mb-4 md:mb-0`}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新しいセットリストを追加
              </button>
              {selectedSetlists.length > 0 && (
                <button onClick={handleOpenDeleteConfirmModal} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2 inline-flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  選択したセットリストを削除
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <Loading />
            ) : setlists.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-500">まだセットリストがありません</p>
                <button onClick={handleOpenModal} className={`mt-4 bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded`}>
                  新しいセットリストを追加
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-300 shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 md:px-3 py-3 text-left max-w-1">
                      <input
                        type="checkbox"
                        className='w-5 h-5'
                        onChange={handleSelectAll}
                        checked={selectedSetlists.length === setlists.length}
                      />
                    </th>
                    <th className="px-1 md:px-3 py-3 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      セットリスト名
                    </th>
                    <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      曲数
                    </th>
                    <th className="px-2 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {setlists.map((setlist) => (
                    <tr
                      className='hover:cursor-pointer hover:bg-gray-100 transition-all'
                      key={setlist.id}
                      onClick={() => router.push(`/setlist/${setlist.id}`)}
                    >
                      <td className="px-1 md:px-3 py-4 whitespace-nowrap max-w-1">
                        <input
                          type="checkbox"
                          className='w-5 h-5'
                          checked={selectedSetlists.includes(setlist.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelect(setlist.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-1 md:px-3 py-4 whitespace-nowrap text-gray-900">
                        {setlist.name}
                      </td>
                      <td className="px-2 md:px-6 py-4 whitespace-nowrap text-gray-900">
                        {setlist.createdAt}
                      </td>
                      <td className="px-2 md:px-6 py-4 whitespace-nowrap text-gray-900">
                        {setlist.songIds ? setlist.songIds.length : 0} 曲
                      </td>
                      <td className="px-2 md:px-6 py-4 whitespace-nowrap text-gray-900 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSetlist(setlist);
                            setIsEditOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {isOpen && <SetlistNameModal isOpen={isOpen} onClose={handleCloseModal} />}
        {isEditOpen && (
          <Modal isOpen={isEditOpen} onClose={handleCloseEditModal}>
            <div className="p-4">
              <h2 className="text-lg mb-4">
                {selectedSetlist ? `${selectedSetlist.name} を削除しますか？` : 'セットリストを削除しますか？'}
              </h2>
              <div className="flex justify-end mt-4">
                <button onClick={handleCloseEditModal} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                  キャンセル
                </button>
                <button onClick={handleDeleteSetlist} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  削除
                </button>
              </div>
            </div>
          </Modal>
        )}
        {isDeleteConfirmOpen && (
          <Modal isOpen={isDeleteConfirmOpen} onClose={handleCloseDeleteConfirmModal}>
            <div className="p-4">
              <h2 className="text-lg mb-4">
                {`${selectedSetlists.length} つのセットリストを削除しますか？`}
              </h2>
              <div className="flex justify-end mt-4">
                <button onClick={handleCloseDeleteConfirmModal} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                  キャンセル
                </button>
                <button onClick={handleDeleteSelected} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  削除
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}