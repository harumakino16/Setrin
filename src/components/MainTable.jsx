import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import SongFieldModal from './SongFieldModal';
import { useSongs } from '../context/SongsContext';
import ContextMenu from './ContextMenu';

function MainTable({
  selectAll,
  handleSelectAll,
  selectedSongs,
  handleSelectSong,
  handleDeleteSong,
  requestSort,
  tableData,
  setModalState,
  modalState,
  refreshSongs,
  onAddToSetlist
}) {
  const { songs } = useSongs();


  const recordsPerPage = 30;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSongs, setCurrentSongs] = useState([]);
  const paginate = pageNumber => setCurrentPage(pageNumber);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setCurrentSongs(tableData.slice(indexOfFirstRecord, indexOfLastRecord));
  }, [tableData, currentPage, recordsPerPage]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);



  const handleEditSong = (songId) => {
    const songToEdit = songs.find(song => song.id === songId);
    setModalState(prev => ({
      ...prev,
      currentSong: songToEdit,
      editSong: true
    }));
  };

  return (
    <div>
      {currentSongs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">まだ曲が登録されていません</p>
          <button onClick={() => setModalState({ ...modalState, addSong: true })} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            曲を追加する
          </button>
        </div>
      ) : (
        <div className="overflow-x-scroll">
          <table className="whitespace-nowrap w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ position: 'relative', top: '2px', minWidth: '30px' }}>
                  <input className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 cursor-pointer" type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                {["曲名", "アーティスト", "ジャンル", "タグ", "カラオケ音源のYoutubeURL", "歌唱回数", "熟練度", "備考", "操作"].map((header, index) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ minWidth: ["150px", "100px", "110px", "100px", "200px", "120px", "110px", "100px", "120px"][index] }} onClick={() => requestSort(["title", "artist", "tags", "genres", "youtubeUrl", "singingCount", "skillLevel", "memo", ""][index])}>
                    <span className="cursor-pointer">
                      {header}
                      <FontAwesomeIcon icon={faSort} className="ml-2" />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSongs.map((song, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition-colors duration-150 ease-in-out"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      song: song
                    });
                  }}
                >
                  <td className="px-3 py-3 whitespace-nowrap">
                    <input
                      className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 cursor-pointer"
                      style={{ position: 'relative', top: '2px' }}
                      type="checkbox"
                      checked={selectedSongs.includes(song.id)}
                      onChange={() => handleSelectSong(song.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.title.length > 15 ? `${song.title.slice(0, 15)}...` : song.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.artist.length > 15 ? `${song.artist.slice(0, 15)}...` : song.artist}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.genre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.tags.join(", ")}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {song.youtubeUrl ? <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-800">リンク</a> : "未登録"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.singingCount}</td>
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
        </div>
      )}

      <div className="flex justify-center mt-4">
        <div className="flex space-x-1">
          {Array.from({ length: Math.ceil(tableData.length / recordsPerPage) }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => paginate(page)} className={`px-4 py-2 ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} border rounded`}>
              {page}
            </button>
          ))}
        </div>
      </div>


      {modalState.editSong && <SongFieldModal onClose={() => setModalState({ ...modalState, editSong: false })} onSongUpdated={refreshSongs} isOpen={modalState.editSong} song={modalState.currentSong} />}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => {
            handleEditSong(contextMenu.song.id);
            setContextMenu(null);
          }}
          onDelete={() => {
            handleDeleteSong(contextMenu.song.id);
            setContextMenu(null);
          }}
          onAddToSetlist={() => {
            onAddToSetlist([contextMenu.song.id]);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div >
  );
}

export default MainTable;
