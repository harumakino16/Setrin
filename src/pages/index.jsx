import { Sidebar } from "@/components/Sidebar";
import { useState, useContext, useEffect } from "react";
import SongFieldModal from "@/components/SongFieldModal";
import ImportModal from "@/components/ImportModal";
import { AuthContext } from "@/context/AuthContext";
import { db } from "../../firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faDownload } from "@fortawesome/free-solid-svg-icons";
import useFetchSongs from "@/hooks/fetchSongs";

export default function Home() {
  const [modalState, setModalState] = useState({
    addSong: false,
    editSong: false,
    import: false,
    currentSong: null
  });
  const { currentUser } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const songs = useFetchSongs(refreshKey);

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

  const handleEditSong = (songId) => {
    const songToEdit = songs.find(song => song.id === songId);
    setModalState(prev => ({
      ...prev,
      currentSong: songToEdit,
      editSong: true
    }));
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-8">
        <div className="flex justify-between mb-4">
          <button onClick={() => toggleModal('addSong', true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">曲を追加する</button>
          <div className="flex space-x-2">
            <button onClick={() => toggleModal('import', true)} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded inline-flex items-center">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />インポート
            </button>
            <button onClick={() => alert("エクスポート機能はまだ実装されていません")} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded inline-flex items-center">
              <FontAwesomeIcon icon={faUpload} className="mr-2" />エクスポート
            </button>
          </div>
        </div>
        {modalState.addSong && <SongFieldModal onClose={() => toggleModal('addSong', false)} onSongUpdated={refreshSongs} isOpen={modalState.addSong} />}
        {modalState.import && <ImportModal onClose={() => toggleModal('import', false)} onSongsUpdated={refreshSongs} isOpen={modalState.import} />}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["曲名", "アーティスト", "タグ", "ジャンル", "カラオケ音源のYoutubeURL", "歌唱回数", "収益化", "熟練度", "操作"].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {songs.map((song, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{song.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.artist}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.tags.join(", ")}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.genres.join(", ")}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {song.youtubeUrl ? <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-800">リンク</a> : "未登録"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.timesSung}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={song.monetized ? "text-green-500" : "text-red-500"}>{song.monetized ? "〇" : "×"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.skillLevel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleEditSong(song.id)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">編集</button>
                    {modalState.editSong && modalState.currentSong === song && <SongFieldModal song={modalState.currentSong} onClose={() => toggleModal('editSong', false)} onSongUpdated={refreshSongs} />}
                    <button onClick={() => handleDeleteSong(song.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">削除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
