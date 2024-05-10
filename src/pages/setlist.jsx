import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar'; // サイドバーをインポート
import SetlistNameModal from '@/components/setlistNameModal';
import { useRouter } from 'next/router';
import useSetlists from '@/hooks/fetchSetlists';
// import { useSongs } from '../context/SongsContext';



export default function Setlist() {
  const { currentUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const { setlists, loading } = useSetlists(); // カスタムフックからセットリストとローディング状態を取得

  const router = useRouter();

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleSetlistAdded = () => {
    fetchSetlists();  // 
  };


  return (
    <div className="flex">
      <Sidebar /> {/* サイドバーを表示 */}
      <div className="flex-grow p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">セットリスト</h1>
          <button onClick={handleOpenModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isOpen ? <SetlistNameModal isOpen={isOpen} onClose={handleCloseModal} onSetlistAdded={handleSetlistAdded} /> : null}
    </div>
  );
}



