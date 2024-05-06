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

export default function Home() {
  const [modalState, setModalState] = useState({
    addSong: false,
    editSong: false,
    import: false,
    currentSong: null,
    addSongsInSetlist: false
  });
  const { currentUser } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const [songs, setSongs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 30;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  // const currentSongs = songs.slice(indexOfFirstRecord, indexOfLastRecord);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentSongs, setCurrentSongs] = useState([]);

  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setCurrentSongs(songs.slice(indexOfFirstRecord, indexOfLastRecord));
  }, [songs, currentPage, recordsPerPage]);


  const fetchedSongs = useFetchSongs(refreshKey, currentUser);
  useEffect(() => {
    setSongs(fetchedSongs);
  }, [fetchedSongs]);

  const handleSearchResults = (results) => {
    setSongs(results);
    setSearchPerformed(true);
  };

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const toggleModal = (modal, value) => {
    setModalState(prev => ({ ...prev, [modal]: value }));
  };

  const refreshSongs = () => setRefreshKey(prevKey => prevKey + 1);

  const handleDeleteSong = async (songId) => {
    if (currentUser) {
      const songRef = doc(db, "users", currentUser.uid, "Songs", songId);
      await deleteDoc(songRef);
      refreshSongs();
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
      refreshSongs();
      setSelectedSongs([]);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sortedSongs = [...songs].sort((a, b) => {
      // 数値として解釈可能かどうかをチェック
      const aValue = a[key];
      const bValue = b[key];
      const aIsNumber = !isNaN(Number(aValue));
      const bIsNumber = !isNaN(Number(bValue));
  
      // 両方の値が数値の場合、数値として比較
      if (aIsNumber && bIsNumber) {
        return direction === 'ascending' ? aValue - bValue : bValue - aValue;
      }
      // それ以外の場合は、文字列として比較
      return direction === 'ascending' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
    });
  
    setSortConfig({ key, direction });
    setSongs(sortedSongs);
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
            <button onClick={() => alert("エクスポート機能はまだ実装されていません")} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded inline-flex items-center">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />エクスポート
            </button>
          </div>
        </div>

        <MainTable
          currentSongs={currentSongs}
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          selectedSongs={selectedSongs}
          handleSelectSong={handleSelectSong}
          handleDeleteSong={handleDeleteSong}
          requestSort={requestSort}
          setModalState={setModalState}
          modalState={modalState}
          songs={songs}
          refreshSongs={refreshSongs}
        />

        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            {Array.from({ length: Math.ceil(songs.length / recordsPerPage) }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => paginate(page)} className={`px-4 py-2 ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} border rounded`}>
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
      {modalState.addSong && <SongFieldModal onClose={() => toggleModal('addSong', false)} onSongUpdated={refreshSongs} isOpen={modalState.addSong} />}
      {modalState.import && <ImportModal onClose={() => toggleModal('import', false)} onSongsUpdated={refreshSongs} isOpen={modalState.import} />}
      {modalState.addSongsInSetlist && <AddSongsInSetlistModal onClose={() => toggleModal('addSongsInSetlist', false)} onSongsUpdated={refreshSongs} isOpen={modalState.addSongsInSetlist} selectedSongs={selectedSongs} currentUser={currentUser} />}
    </div>
  );
}
