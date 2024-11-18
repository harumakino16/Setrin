// index.jsx

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { db } from "../../firebaseConfig";
import { deleteDoc, doc, collection, getDocs, writeBatch } from "firebase/firestore";
import SearchForm from "@/components/searchForm";
import AddSongsInSetlistModal from "@/components/AddSongsInSetlistModal";
import MainTable from "@/components/MainTable"; // MainTableをインポート
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useMessage } from "@/context/MessageContext";
import { useSongs } from '../context/SongsContext';
import useSearchCriteria from '@/hooks/useSearchCriteria'; // カスタムフックをインポート
import AddSongModal from '@/components/AddSongModal'; // 新しいコンポーネントをインポート
import LoginFormModal from "@/components/LoginFormModal";
import { FaPen } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  const [modalState, setModalState] = useState({
    addSong: false,
    editSong: false,
    import: false,
    currentSong: null,
    addSongsInSetlist: false
  });

  const { currentUser } = useContext(AuthContext);
  const { songs } = useSongs();
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { searchCriteria, setSearchCriteria } = useSearchCriteria({}); // カスタムフックを使用
  const [selectAll, setSelectAll] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const { setMessageInfo } = useMessage();
  const [tableData, setTableData] = useState([]);
  const { theme } = useTheme();

  // 初期状態では、全曲をテーブルに表示
  useEffect(() => {
    setTableData(songs);
  }, []);

  // この useEffect を削除またはコメントアウトします
  // useEffect(() => {
  //   setTableData(songs);
  // }, [songs]);

  const handleSearchResults = (results) => {
    setTableData(results);
    setSearchPerformed(true);
  };

  const toggleModal = (modal) => {
    setModalState(prev => ({ ...prev, [modal]: !prev[modal] }));
  };

  const handleDeleteSong = async (songId) => {
    try {
      // 曲を削除
      await deleteDoc(doc(db, 'users', currentUser.uid, 'Songs', songId));

      // セットリストを更新
      const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
      const setlistsSnapshot = await getDocs(setlistsRef);
      const batch = writeBatch(db);

      setlistsSnapshot.forEach((setlistDoc) => {
        const setlistData = setlistDoc.data();
        if (setlistData.songIds && setlistData.songIds.includes(songId)) {
          const updatedSongIds = setlistData.songIds.filter(id => id !== songId);
          batch.update(setlistDoc.ref, { songIds: updatedSongIds });
        }
      });

      await batch.commit();
      setMessageInfo({ message: '曲が削除され、セットリストが更新されました。', type: 'success' });
    } catch (error) {
      
      setMessageInfo({ message: '曲の削除に失敗しました。', type: 'error' });
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedSongs(selectAll ? [] : tableData.map(song => song.id));
  };

  const handleSelectSong = (songId) => {
    setSelectedSongs(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const handleDeleteSelectedSongs = async () => {
    if (currentUser && selectedSongs.length > 0) {
      try {
        const batch = writeBatch(db);

        // 選択された曲を削除
        selectedSongs.forEach(songId => {
          const songRef = doc(db, "users", currentUser.uid, "Songs", songId);
          batch.delete(songRef);
        });

        // セットリストを更新
        const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
        const setlistsSnapshot = await getDocs(setlistsRef);

        setlistsSnapshot.forEach((setlistDoc) => {
          const setlistData = setlistDoc.data();
          const updatedSongIds = setlistData.songIds.filter(id => !selectedSongs.includes(id));
          if (updatedSongIds.length !== setlistData.songIds.length) {
            batch.update(setlistDoc.ref, { songIds: updatedSongIds });
          }
        });

        await batch.commit();
        setSelectedSongs([]);
        setMessageInfo({ message: '選択された曲が削除され、セットリストが更新されました。', type: 'success' });
      } catch (error) {
        
        setMessageInfo({ message: '曲の削除に失敗しました。', type: 'error' });
      }
    }
  };

  const sortSongs = (songs, key, direction) => {
    return [...songs].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // 配列の場合（tagsなど）は文字列に変換
      if (Array.isArray(aValue)) aValue = aValue.join(', ');
      if (Array.isArray(bValue)) bValue = bValue.join(', ');

      // 数値型の場合
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return direction === 'ascending' 
          ? Number(aValue) - Number(bValue) 
          : Number(bValue) - Number(aValue);
      }

      // 文字列の場合
      return direction === 'ascending'
        ? String(aValue || '').localeCompare(String(bValue || ''))
        : String(bValue || '').localeCompare(String(aValue || ''));
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedSongs = sortSongs(tableData, key, direction); // songs -> tableData
    setSortConfig({ key, direction });
    setTableData(sortedSongs);
  };

  const headers = [
    { label: "曲名", key: "title" },
    { label: "フリガナ", key: "furigana" },
    { label: "アーティスト", key: "artist" },
    { label: "YouTube", key: "youtubeUrl" },
    { label: "ジャンル", key: "genre" },
    { label: "タグ1", key: "tag1" },
    { label: "タグ2", key: "tag2" },
    { label: "タグ3", key: "tag3" },
    { label: "歌った回数", key: "singingCount" },
    { label: "熟練度", key: "skillLevel" },
    { label: "備考", key: "memo" }
  ];

  const csvReport = {
    filename: 'SongList.csv',
    headers: headers,
    data: tableData.map(song => ({
      ...song,
      furigana: song.furigana || '',
      tag1: song.tags[0] || '',
      tag2: song.tags[1] || '',
      tag3: song.tags[2] || ''
    }))
  };

  const handleAddToSetlist = (songIds) => {
    setSelectedSongs(songIds);
    setModalState(prev => ({ ...prev, addSongsInSetlist: true }));
  };

  // 未ログイン時のデザイン
if (!currentUser) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Setlinkへようこそ</h1>
      <p className="text-xl text-gray-600 mb-8">音楽体験を次のレベルへ</p>
      <LoginForm />
    </div>
  );
}

  return (
    <div className="flex flex-col sm:flex-row w-full">
      <div className="flex-grow w-full p-0 sm:p-4">
        <SearchForm currentUser={currentUser} handleSearchResults={handleSearchResults} searchCriteria={searchCriteria} setSearchCriteria={setSearchCriteria} />
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-between mb-3">
          {selectedSongs.length > 0 ? (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <span className="self-center text-gray-500">{selectedSongs.length}件選択中</span>
              <button onClick={() => toggleModal('addSongsInSetlist', true)} className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded inline-flex items-center`}>
                <FontAwesomeIcon icon={faFolderPlus} className="mr-2" />セットリストに追加
              </button>
              <button onClick={handleDeleteSelectedSongs} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                <FontAwesomeIcon icon={faTrash} className="mr-2" />まとめて削除
              </button>
            </div>
          ) : (<div></div>)}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button onClick={() => toggleModal('addSong', true)} className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded shadow inline-flex items-center`}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              曲を追加する
            </button>
            <button
              onClick={() => setModalState(prev => ({ ...prev, columnSettings: true }))}
              className="text-gray-500 py-2 px-4 text-sm rounded flex items-center"
            >
              <FaPen className="mr-2" />
              列の表示
            </button>
          </div>
        </div>

        <MainTable
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          selectedSongs={selectedSongs}
          handleSelectSong={handleSelectSong}
          handleDeleteSong={handleDeleteSong}
          requestSort={requestSort}
          setModalState={setModalState}
          modalState={modalState}
          tableData={tableData}
          onAddToSetlist={handleAddToSetlist}
          sortConfig={sortConfig}
        />

        {modalState.addSong && <AddSongModal onClose={() => toggleModal('addSong')} isOpen={modalState.addSong} />}
        {modalState.addSongsInSetlist && <AddSongsInSetlistModal onClose={() => toggleModal('addSongsInSetlist')} isOpen={modalState.addSongsInSetlist} selectedSongs={selectedSongs} currentUser={currentUser} />}
        {!currentUser && <LoginFormModal isOpen={!currentUser} />}
      </div>
    </div>
  );
}
