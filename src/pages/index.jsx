// index.jsx

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { db } from "../../firebaseConfig";
import { deleteDoc, doc, collection, getDocs, writeBatch, getCountFromServer } from "firebase/firestore";
import SearchForm from "@/components/SearchForm";
import AddSongsInSetlistModal from "@/components/AddSongsInSetlistModal";
import MainTable from "@/components/MainTable"; // MainTableをインポート
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus, faTrash, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { useMessage } from "@/context/MessageContext";
import { useSongs } from '../context/SongsContext';
import useSearchCriteria from '@/hooks/useSearchCriteria'; // カスタムフックをインポート
import AddSongModal from '@/components/AddSongModal'; // 新しいコンポーネントをインポート
import LoginFormModal from "@/components/LoginFormModal";
import { FaPen } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import Layout from "@/pages/layout";
import NoSidebarLayout from "./noSidebarLayout";
import { exportToCSV } from '../utils/csvUtils'; // 新しいファイルからインポート

export default function Home() {
  const [modalState, setModalState] = useState({
    addSong: false,
    editSong: false,
    import: false,
    currentSong: null,
    addSongsInSetlist: false
  });

  const { currentUser } = useContext(AuthContext);
  const { songs, setSongs } = useSongs();
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

  useEffect(() => {
    if (!searchPerformed) {
      let sortedSongs = songs;
      if (sortConfig.key) {
        sortedSongs = sortSongs(songs, sortConfig.key, sortConfig.direction);
      }
      setTableData(sortedSongs);
    }
  }, [songs, sortConfig, searchPerformed]); // searchPerformed を依存配列に追加

  const handleSearchResults = (results) => {
    if (sortConfig.key) {
      results = sortSongs(results, sortConfig.key, sortConfig.direction);
    }
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

        // 選択され曲を削除
        selectedSongs.forEach(songId => {
          const songRef = doc(db, "users", currentUser.uid, "Songs", songId);
          batch.delete(songRef);
        });

        // セットリストを更新
        const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
        const setlistsSnapshot = await getDocs(setlistsRef);

        setlistsSnapshot.forEach((setlistDoc) => {
          const setlistData = setlistDoc.data();
          if (setlistData.songIds) {
            const updatedSongIds = setlistData.songIds.filter(id => !selectedSongs.includes(id));
            if (updatedSongIds.length !== setlistData.songIds.length) {
              batch.update(setlistDoc.ref, { songIds: updatedSongIds });
            }
          }
        });

        await batch.commit();
        setSelectedSongs([]);
        setMessageInfo({ message: '選択された曲が削除され、セットリストが更新されました。', type: 'success' });
      } catch (error) {
        setMessageInfo({ message: '曲の削除に失敗しました。', type: 'error' });
        console.error(error);
      }
    }
  };

  const sortSongs = (songs, key, direction) => {
    return [...songs].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // フリガナが存在する場合はフリガナを優先して使用
      if (key === 'title') {
        aValue = a.furigana || a.title;
        bValue = b.furigana || b.title;
      }

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
    setSortConfig({ key, direction });
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
    { label: "タグ4", key: "tag4" },
    { label: "タグ5", key: "tag5" },
    { label: "歌った回数", key: "singingCount" },
    { label: "熟練度", key: "skillLevel" },
    { label: "備考", key: "memo" }
  ];

  const handleAddToSetlist = (songIds) => {
    setSelectedSongs(songIds);
    setModalState(prev => ({ ...prev, addSongsInSetlist: true }));
  };

  const handleAddSong = async () => {
    // 現在の曲数を取得
    const songsRef = collection(db, 'users', currentUser.uid, 'Songs');
    const snapshot = await getCountFromServer(songsRef);
    const songCount = snapshot.data().count;

    if (currentUser.plan === 'free' && songCount >= 1000) {
      if (confirm('無料プランでは1,000曲まで追加できます。有料プランにアップグレードしますか？')) {
        router.push('/setting');
      }
      return;
    }

  };

  const handleIncreaseSingingCount = (songId) => {
    setSongs(prevSongs =>
      prevSongs.map(song =>
        song.id === songId ? { ...song, singingCount: song.singingCount + 1 } : song
      )
    );
  };

  const handleDecreaseSingingCount = (songId) => {
    setSongs(prevSongs =>
      prevSongs.map(song =>
        song.id === songId ? { ...song, singingCount: Math.max(song.singingCount - 1, 0) } : song
      )
    );
  };

  // 未ログイン時のデザイン
  if (!currentUser) {
    return (
      <NoSidebarLayout>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-6">Setlinkへようこそ</h1>
            <p className="text-xl mb-8 text-center md:text-left">Vtuberの歌枠をもっと簡単に</p>
            <LoginForm />
          </div>
          <div className="bg-white bg-opacity-20 rounded-t-3xl p-8 text-left backdrop-filter backdrop-blur-lg">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Setlinkとは？</h2>
              <p className="text-lg mb-6">
                SetlinkはVtuberのための無料歌枠管理ツールです。<br />歌える曲リストを手軽に管理し、ランダムセットリストを作成し、YouTubeと連携して再生リストを作成したり、再生リストから曲を取り込んだりできます。
              </p>
              <h2 className="text-3xl font-bold mb-4">特徴</h2>
              <ul className="list-disc list-inside text-lg mb-6 space-y-2">
                <li>🎵 <strong>簡単なセトリ作成：</strong>直感的なインターフェースで、数クリックで自由にセトリを作成</li>
                <li>🎬 <strong>YouTube連携：</strong>YouTubeと連携して、再生リストを作成</li>
                <li>📁 <strong>詳細な曲管理：</strong>曲名、アーティスト、ジャンル、タグなどで曲を整理</li>
                <li>🔀 <strong>ランダムセトリ作成：</strong>指定した条件でランダムにセトリを生成</li>
                <li>👂 <strong>歌える曲リスト：</strong>歌える曲リストをリスナーに共有</li>
              </ul>
              <div className="text-center">
                <Link legacyBehavior href="/lp">
                  <a className="inline-block bg-customTheme-blue-primary hover:bg-customTheme-blue-accent text-white font-bold py-3 px-6 rounded-full transition duration-300">
                    詳しくはこちら &raquo;
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </NoSidebarLayout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row w-full">
        <div className="flex-grow w-full p-0 sm:p-4">
          <SearchForm 
            currentUser={currentUser} 
            handleSearchResults={handleSearchResults} 
            searchCriteria={searchCriteria} 
            setSearchCriteria={setSearchCriteria} 
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-between mb-3">
            {selectedSongs.length > 0 ? (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <span className="self-center text-gray-500">{selectedSongs.length}件選択中</span>
                <button onClick={() => toggleModal('addSongsInSetlist')} className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded inline-flex items-center`}>
                  <FontAwesomeIcon icon={faFolderPlus} className="mr-2" />セットリストに追加
                </button>
                <button onClick={handleDeleteSelectedSongs} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />まとめて削除
                </button>
              </div>
            ) : (<div></div>)}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button onClick={() => toggleModal('addSong')} className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded shadow inline-flex items-center`}>
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
              <button
                onClick={() => exportToCSV(tableData)}
                className={`flex items-center bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded`}
              >
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                エクスポート
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            
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
            handleIncreaseSingingCount={handleIncreaseSingingCount}
            handleDecreaseSingingCount={handleDecreaseSingingCount}
          />

          {modalState.addSong && <AddSongModal onClose={() => toggleModal('addSong')} isOpen={modalState.addSong} />}
          {modalState.addSongsInSetlist && <AddSongsInSetlistModal onClose={() => toggleModal('addSongsInSetlist')} isOpen={modalState.addSongsInSetlist} selectedSongs={selectedSongs} currentUser={currentUser} />}
          {!currentUser && <LoginFormModal isOpen={!currentUser} />}
        </div>
      </div>
    </Layout>
  );
}
