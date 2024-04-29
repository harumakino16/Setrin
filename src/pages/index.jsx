import { Sidebar } from "@/components/Sidebar";
import { useState, useContext, useEffect } from "react";
import SongFieldModal from "@/components/SongFieldModal";
import ImportModal from "@/components/ImportModal"; // ImportModalをインポート
import { AuthContext } from "@/context/AuthContext";
import { db } from "../../firebaseConfig";
import { deleteDoc, doc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faDownload } from "@fortawesome/free-solid-svg-icons";
import useFetchSongs from "@/hooks/fetchSongs"; // カスタムフックをインポート

export default function Home() {
  const [AddSongshowModal, setAddSongshowModal] = useState(false);
  const [EditSongshowModal, setEditSongshowModal] = useState(false);
  const [ImportShowModal, setImportShowModal] = useState(false); // インポートモーダルの状態を管理
  const [currentSong, setCurrentSong] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0); // このキーを更新して曲データをリフレッシュ
  const songs = useFetchSongs(refreshKey); // カスタムフックを使用して曲を取得

  const refreshSongs = () => {
    setRefreshKey(oldKey => oldKey + 1); // キーを更新してフックを再起動
  };

  const handleOpenModal = () => {
    setAddSongshowModal(true);
  };

  const handleCloseModal = () => {
    setAddSongshowModal(false);
  };

  const handleDeleteSong = async (songId) => {
    if (currentUser) {
      const songRef = doc(db, "users", currentUser.uid, "Songs", songId);
      await deleteDoc(songRef);
      refreshSongs(); // 曲を削除した後、曲リストを更新
    } else {
      console.log("ユーザーが認証されていません。");
    }
  };

  const handleEditSong = (songId) => {
    const songToEdit = songs.find(song => song.id === songId);
    setCurrentSong(songToEdit);
    setEditSongshowModal(true);
  };

  const handleImport = () => {
    setImportShowModal(true); // インポートモーダルを表示
  };

  const handleExport = () => {
    alert("エクスポート機能はまだ実装されていません");
  };



  return (
    <div>
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-8">
          <div className="flex justify-between mb-4">
            <button onClick={handleOpenModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow">曲を追加する</button>
            <div className="flex space-x-2">
              <button onClick={handleImport} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded inline-flex items-center">
                <FontAwesomeIcon icon={faDownload} className="mr-2" />インポート
              </button>
              <button onClick={handleExport} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded inline-flex items-center">
                <FontAwesomeIcon icon={faUpload} className="mr-2" />エクスポート
              </button>
            </div>
          </div>
          {AddSongshowModal ? <SongFieldModal onClose={handleCloseModal} onSongUpdated={refreshSongs} /> : null}
          {ImportShowModal ? <ImportModal onClose={() => setImportShowModal(false)} onSongsUpdated={refreshSongs} /> : null}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">曲名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アーティスト</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タグ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ジャンル</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カラオケ音源のYoutubeURL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">歌唱回数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">収益化</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {songs.map((song, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{song.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{song.artist}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{song.tags.join(", ")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{song.genres.join(", ")}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-800">リンク</a></td>
                    <td className="px-6 py-4 whitespace-nowrap">{song.timesSung}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={song.monetized ? "text-green-500" : "text-red-500"}>
                        {song.monetized ? "〇" : "×"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleEditSong(song.id)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">編集</button>
                      {EditSongshowModal && currentSong === song ? <SongFieldModal song={currentSong} onClose={() => setEditSongshowModal(false)} onSongUpdated={refreshSongs}/> : null}
                      <button onClick={() => handleDeleteSong(song.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">削除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
