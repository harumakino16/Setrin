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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col p-4 md:p-8">
          <H1>セットリスト</H1>
          <div className="flex justify-end mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleOpenModal}
                className={`
                  bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent 
                  text-white font-medium py-2.5 px-4 rounded-lg
                  transition-all duration-200 ease-in-out
                  flex items-center justify-center min-w-[200px]
                  shadow-sm hover:shadow-md
                `}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新規セットリスト
              </button>
              {selectedSetlists.length > 0 && (
                <button
                  onClick={handleOpenDeleteConfirmModal}
                  className="
                    bg-red-500 hover:bg-red-600 text-white 
                    font-medium py-2.5 px-4 rounded-lg
                    transition-all duration-200 ease-in-out
                    flex items-center justify-center min-w-[200px]
                    shadow-sm hover:shadow-md
                  "
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {selectedSetlists.length}件を削除
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8">
                <Loading />
              </div>
            ) : setlists.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="mt-4 text-gray-500 text-lg">セットリストがありません</p>
                <button
                  onClick={handleOpenModal}
                  className={`
                    mt-4 bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent 
                    text-white font-medium py-2.5 px-6 rounded-lg
                    transition-all duration-200 ease-in-out
                  `}
                >
                  最初のセットリストを作成
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-4 text-left">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-300 text-customTheme-${theme}-primary focus:ring-customTheme-${theme}-accent"
                          onChange={handleSelectAll}
                          checked={selectedSetlists.length === setlists.length}
                        />
                      </th>
                      <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        セットリスト名
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        作成日
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        曲数
                      </th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {setlists.map((setlist) => (
                      <tr
                        key={setlist.id}
                        onClick={() => router.push(`/setlist/${setlist.id}`)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out cursor-pointer"
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
              </div>
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