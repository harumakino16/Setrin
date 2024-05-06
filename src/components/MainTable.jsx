import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import SongFieldModal from './SongFieldModal';


function MainTable({
  currentSongs,
  selectAll,
  handleSelectAll,
  selectedSongs,
  handleSelectSong,
  handleDeleteSong,
  requestSort,
  songs,
  setModalState,
  modalState,
  refreshSongs
}) {
  const handleEditSong = (songId) => {
    const songToEdit = songs.find(song => song.id === songId);
    setModalState(prev => ({
      ...prev,
      currentSong: songToEdit,
      editSong: true
    }));
  };

  return (
    <div className="">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '30px' }}>
              <input className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300" type="checkbox" checked={selectAll} onChange={handleSelectAll} />
            </th>
            {["曲名", "アーティスト", "タグ", "ジャンル", "カラオケ音源のYoutubeURL", "歌唱回数", "熟練度", "備考", "操作"].map((header, index) => (
              <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
                <FontAwesomeIcon icon={faSort} onClick={() => requestSort(["title", "artist", "tags", "genres", "youtubeUrl", "timesSung", "skillLevel", "memo", ""][index])} className="ml-2 cursor-pointer" />
              </th>
            ))}

          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentSongs.map((song, index) => (
            <tr key={index}>
              <td className="px-3 py-4 whitespace-nowrap"><input className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300" type="checkbox" checked={selectedSongs.includes(song.id)} onChange={() => handleSelectSong(song.id)} /></td>
              <td className="px-6 py-4 whitespace-nowrap">{song.title.length > 10 ? `${song.title.slice(0, 10)}...` : song.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">{song.artist.length > 10 ? `${song.artist.slice(0, 10)}...` : song.artist}</td>
              <td className="px-6 py-4 whitespace-nowrap">{song.tags.join(", ")}</td>
              <td className="px-6 py-4 whitespace-nowrap">{song.genres.join(", ")}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {song.youtubeUrl ? <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-800">リンク</a> : "未登録"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{song.timesSung}</td>
              <td className="px-6 py-4 whitespace-nowrap">{song.skillLevel}</td>
              <td className="px-6 py-4 whitespace-nowrap">{song.memo}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button onClick={() => handleEditSong(song.id)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">編集</button>
                <button onClick={() => handleDeleteSong(song.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalState.editSong && <SongFieldModal onClose={() => setModalState({ ...modalState, editSong: false })} onSongUpdated={refreshSongs} isOpen={modalState.editSong} song={modalState.currentSong} />}

    </div>
  );
}

export default MainTable;
