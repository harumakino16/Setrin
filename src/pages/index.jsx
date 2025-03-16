// index.jsx

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { db } from "../../firebaseConfig";
import { deleteDoc, doc, collection, getDocs, writeBatch, getCountFromServer, updateDoc, increment } from "firebase/firestore";
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
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BulkEditModal from '@/components/BulkEditModal';
import { useRouter } from 'next/router';
import CtaComponent from "@/components/CtaComponent";
import OtosapoAdBanner from "@/components/OtosapoAdBanner";
export default function Home() {
  const [modalState, setModalState] = useState({
    addSong: false,
    editSong: false,
    import: false,
    currentSong: null,
    addSongsInSetlist: false,
    bulkEdit: false
  });

  const { currentUser } = useContext(AuthContext);
  const { songs, setSongs } = useSongs();
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { searchCriteria, setSearchCriteria } = useSearchCriteria({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const { setMessageInfo } = useMessage();
  const [tableData, setTableData] = useState([]);
  const { theme } = useTheme();
  const { t } = useTranslation('common'); // i18nextフック
  const router = useRouter();

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
  }, [songs, sortConfig, searchPerformed]);

  const handleSearchResults = (results) => {
    if (sortConfig.key) {
      results = sortSongs(results, sortConfig.key, sortConfig.direction);
    }
    setTableData(results);
    setSearchPerformed(true);
  };

  const toggleModal = (modal) => {
    setModalState((prev) => ({ ...prev, [modal]: !prev[modal] }));
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
          const updatedSongIds = setlistData.songIds.filter((id) => id !== songId);
          batch.update(setlistDoc.ref, { songIds: updatedSongIds });
        }
      });

      await batch.commit();
      setMessageInfo({ message: t('songDeletedSetlistUpdated'), type: 'success' });
    } catch (error) {
      setMessageInfo({ message: t('songDeletionFailed'), type: 'error' });
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedSongs(selectAll ? [] : tableData.map((song) => song.id));
  };

  const handleSelectSong = (songId) => {
    setSelectedSongs((prev) => {
      if (prev.includes(songId)) {
        return prev.filter((id) => id !== songId);
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
        selectedSongs.forEach((songId) => {
          const songRef = doc(db, 'users', currentUser.uid, 'Songs', songId);
          batch.delete(songRef);
        });

        // セットリストを更新
        const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
        const setlistsSnapshot = await getDocs(setlistsRef);

        setlistsSnapshot.forEach((setlistDoc) => {
          const setlistData = setlistDoc.data();
          if (setlistData.songIds) {
            const updatedSongIds = setlistData.songIds.filter(
              (id) => !selectedSongs.includes(id)
            );
            if (updatedSongIds.length !== setlistData.songIds.length) {
              batch.update(setlistDoc.ref, { songIds: updatedSongIds });
            }
          }
        });

        await batch.commit();
        setSelectedSongs([]);
        setMessageInfo({ message: t('selectedSongsDeletedSetlistUpdated'), type: 'success' });
      } catch (error) {
        setMessageInfo({ message: t('songDeletionFailed'), type: 'error' });
        console.error(error);
      }
    }
  };

  const sortSongs = (songs, key, direction) => {
    return [...songs].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      // フリガナが存在する場合はフリガナを優先
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

  // CSVエクスポート用のヘッダー（列名）
  const headers = [
    { label: t('songTitle'), key: "title" },
    { label: t('furigana'), key: "furigana" },
    { label: t('artist'), key: "artist" },
    { label: t('youtube'), key: "youtubeUrl" },
    { label: t('genre'), key: "genre" },
    { label: t('tag1'), key: "tag1" },
    { label: t('tag2'), key: "tag2" },
    { label: t('tag3'), key: "tag3" },
    { label: t('tag4'), key: "tag4" },
    { label: t('tag5'), key: "tag5" },
    { label: t('singingCount'), key: "singingCount" },
    { label: t('skillLevel'), key: "skillLevel" },
    { label: t('memo'), key: "memo" }
  ];

  const handleAddToSetlist = (songIds) => {
    setSelectedSongs(songIds);
    setModalState((prev) => ({ ...prev, addSongsInSetlist: true }));
  };

  const handleAddSong = async () => {
    // 現在の曲数を取得
    const songsRef = collection(db, 'users', currentUser.uid, 'Songs');
    const snapshot = await getCountFromServer(songsRef);
    const songCount = snapshot.data().count;

    if (currentUser.plan === 'free' && songCount >= 1000) {
      if (confirm(t('freePlanUpTo1000SongsUpgradeConfirm'))) {
        router.push('/setting');
      }
      return;
    }
  };

  const handleIncreaseSingingCount = async (songId) => {
    try {
      // ローカルの状態を更新
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId ? { ...song, singingCount: song.singingCount + 1 } : song
        )
      );

      // Firestoreのsongドキュメントを更新
      const songDocRef = doc(db, 'users', currentUser.uid, 'Songs', songId);
      await updateDoc(songDocRef, {
        singingCount: increment(1)
      });
    } catch (error) {
      console.error('歌唱回数の更新に失敗しました:', error);
      setMessageInfo({ message: '歌唱回数の更新に失敗しました', type: 'error' });
    }
  };

  const handleDecreaseSingingCount = async (songId) => {
    try {
      // ローカルの状態を更新
      setSongs((prevSongs) =>
        prevSongs.map((song) =>
          song.id === songId
            ? { ...song, singingCount: Math.max(song.singingCount - 1, 0) }
            : song
        )
      );

      // Firestoreのsongドキュメントを更新
      const songDocRef = doc(db, 'users', currentUser.uid, 'Songs', songId);
      await updateDoc(songDocRef, {
        singingCount: increment(-1)
      });
    } catch (error) {
      console.error('歌唱回数の更新に失敗しました:', error);
      setMessageInfo({ message: '歌唱回数の更新に失敗しました', type: 'error' });
    }
  };

  // 未ログインユーザーをlpページにリダイレクト
  useEffect(() => {
    if (!currentUser) {
      router.push('/lp');
    }
  }, [currentUser, router]);

  // ローディング中の表示（または何も返さない）
  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row w-full">
        <div className="flex-grow w-full p-0 sm:p-4">
          {/* おとさぽ！バナー広告 - ページネーションの直下に配置 */}
          {new Date() < new Date('2025-03-25T00:00:00') && <OtosapoAdBanner />}
          {/* <CtaComponent
            title="リクエスト歌枠ツールを使ってみよう"
            description="リクエスト歌枠ツールが実装されました。下のボタンをクリックするとリクエスト歌枠管理ページへ移動できます。リクエスト歌枠ツールでは、リスナーからのリクエストを受付・停止したり、届いたリクエストを確認・消化して管理することができます。"
            buttonText="リクエスト歌枠ツールへ移動する"
            buttonLink="/utawakutool/request-utawaku"
            ctaId="request-mode-cta"
          /> */}
          <SearchForm
            currentUser={currentUser}
            handleSearchResults={handleSearchResults}
            searchCriteria={searchCriteria}
            setSearchCriteria={setSearchCriteria}
          />
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-between mb-3">
            {selectedSongs.length > 0 ? (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {/* 件数表示：{{count}}件選択中 */}
                <span className="self-center text-gray-500">
                  {t('countSelectedItems', { count: selectedSongs.length })}
                </span>
                <button
                  onClick={() => toggleModal('addSongsInSetlist')}
                  className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded inline-flex items-center`}
                >
                  <FontAwesomeIcon icon={faFolderPlus} className="mr-2" />
                  {t('addToSetlist')}
                </button>
                <button
                  onClick={() => toggleModal('bulkEdit')}
                  className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <FaPen className="mr-2" />
                  {t('bulkEdit')}
                </button>
                <button
                  onClick={handleDeleteSelectedSongs}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  {t('deleteMultiple')}
                </button>
              </div>
            ) : (
              <div></div>
            )}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => toggleModal('addSong')}
                className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded shadow inline-flex items-center`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('addSong')}
              </button>
              <button
                onClick={() => setModalState((prev) => ({ ...prev, columnSettings: true }))}
                className="text-gray-500 py-2 px-4 text-sm rounded flex items-center"
              >
                <FaPen className="mr-2" />
                {t('showColumns')}
              </button>
              <button
                onClick={() => exportToCSV(tableData)}
                className={`flex items-center bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded`}
              >
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                {t('exportButton')}
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
            handleIncreaseSingingCount={handleIncreaseSingingCount}
            handleDecreaseSingingCount={handleDecreaseSingingCount}
          />

          {modalState.addSong && (
            <AddSongModal
              onClose={() => toggleModal('addSong')}
              isOpen={modalState.addSong}
            />
          )}
          {modalState.addSongsInSetlist && (
            <AddSongsInSetlistModal
              onClose={() => toggleModal('addSongsInSetlist')}
              isOpen={modalState.addSongsInSetlist}
              selectedSongs={selectedSongs}
              currentUser={currentUser}
            />
          )}
          {!currentUser && <LoginFormModal isOpen={!currentUser} />}
          {modalState.bulkEdit && (
            <BulkEditModal
              isOpen={modalState.bulkEdit}
              onClose={() => {
                toggleModal('bulkEdit');
                setSelectedSongs([]);
                setSelectAll(false);
                setMessageInfo({ message: t('bulkEditCompleted'), type: 'success' });
              }}
              selectedSongs={selectedSongs}
              songs={songs}
              refreshSongs={() => {
                if (typeof refreshSongs === 'function') {
                  refreshSongs();
                }
              }}
            />
          )}
        </div>
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
