import { Sidebar } from "@/components/Sidebar";
import { useState, useContext, useEffect } from "react";
import SongFieldModal from "@/components/SongFieldModal";
import ImportModal from "@/components/ImportModal";
import { AuthContext } from "@/context/AuthContext";
import { db } from "../../firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import useFetchSongs from "@/hooks/fetchSongs";
import SearchForm from "@/components/searchForm";
import AddSongsInSetlistModal from "@/components/AddSongsInSetlistModal";
import MainTable from "@/components/MainTable"; // MainTableをインポート
import { FontAwesomeIcon, } from "@fortawesome/react-fontawesome";
import { faDownload, faFolderPlus, faSort, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { useMessage } from "@/context/MessageContext";
import { useRouter } from 'next/router';
import { useSongs } from '../context/SongsContext';
import { CSVLink } from "react-csv";

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
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const { setMessageInfo } = useMessage();
  const [tableData, setTableData] = useState([]);

  // 最初のロード時は全ての曲を取得する
  useEffect(() => {
    setTableData(songs);
  }, []);

  // songs ステートが更新されるたびに実行されます。
  useEffect(() => {
    setTableData(songs);
  }, [songs]);


  const handleSearchResults = (results) => {
    setTableData(results);
    setSearchPerformed(true);
  };


  const toggleModal = (modal) => {
    setModalState(prev => ({ ...prev, [modal]: !prev[modal] }));
};


  const handleDeleteSong = async (songId) => {
    if (currentUser) {
      const songRef = doc(db, "users", currentUser.uid, "Songs", songId);
      await deleteDoc(songRef);
    } else {
      console.log("ユーザーが認証されていません。");
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedSongs(selectAll ? [] : songs.map(song => song.id));
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
      await Promise.all(selectedSongs.map(songId => {
        const songRef = doc(db, "users", currentUser.uid, "Songs", songId);
        return deleteDoc(songRef);
      }));
      setSelectedSongs([]);
    }
  };

  const sortSongs = (songs, key, direction) => {
    return [...songs].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      const aIsNumber = !isNaN(Number(aValue));
      const bIsNumber = !isNaN(Number(bValue));

      if (aIsNumber && bIsNumber) {
        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }
      return direction === 'ascending' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedSongs = sortSongs(songs, key, direction);
    setSortConfig({ key, direction });
    setTableData(sortedSongs);
  };


  const headers = [
    { label: "曲名", key: "title" },
    { label: "アーティスト", key: "artist" },
    { label: "カラオケ音源のYoutubeURL", key: "youtubeUrl" },
    { label: "ジャンル", key: "genre" },
    { label: "タグ1", key: "tag1" },
    { label: "タグ2", key: "tag2" },
    { label: "タグ3", key: "tag3" },
    { label: "歌った回数", key: "timesSung" },
    { label: "熟練度", key: "skillLevel" },
    { label: "備考", key: "memo" }
  ];

  const csvReport = {
    filename: 'SongList.csv',
    headers: headers,
    data: tableData.map(song => ({
      ...song,
      tag1: song.tags[0] || '',
      tag2: song.tags[1] || '',
      tag3: song.tags[2] || ''
    }))
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-8">
        <SearchForm currentUser={currentUser} handleSearchResults={handleSearchResults} />
        <div className="flex space-x-2 justify-between mb-3">
          {selectedSongs.length > 0 ? (
            <div className="flex space-x-2">
              <button onClick={() => toggleModal('addSongsInSetlist', true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                <FontAwesomeIcon icon={faFolderPlus} className="mr-2" />再生リストに追加
              </button>
              <button onClick={handleDeleteSelectedSongs} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                <FontAwesomeIcon icon={faTrash} className="mr-2" />まとめて削除
              </button>
            </div>
          ) : (<div></div>)}
          <div className="flex space-x-2">
            <button onClick={() => toggleModal('addSong', true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">曲を追加する</button>
            <button onClick={() => toggleModal('import', true)} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded inline-flex items-center">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />インポート
            </button>
            <CSVLink {...csvReport} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded inline-flex items-center">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />エクスポート
            </CSVLink>
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
        />


{modalState.addSong && <SongFieldModal onClose={() => toggleModal('addSong')} isOpen={modalState.addSong} />}
{modalState.import && <ImportModal onClose={() => toggleModal('import')} isOpen={modalState.import} />}
{modalState.addSongsInSetlist && <AddSongsInSetlistModal onClose={() => toggleModal('addSongsInSetlist')} isOpen={modalState.addSongsInSetlist} selectedSongs={selectedSongs} currentUser={currentUser} />}
      </div>
    </div>
  );
}
