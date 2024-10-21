import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faYoutube } from '@fortawesome/free-brands-svg-icons';
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
  const [activeRow, setActiveRow] = useState(null); // 追加

  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setCurrentSongs(tableData.slice(indexOfFirstRecord, indexOfLastRecord));
  }, [tableData, currentPage, recordsPerPage]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setActiveRow(null); // 追加
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

   // contextMenu が閉じられたときに activeRow をリセット
   useEffect(() => {
    if (!contextMenu) {
      setActiveRow(null);
    }
  }, [contextMenu]);

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
                {["曲名", "アーティスト", "ジャンル", "タグ", "YouTube", "歌唱回数", "熟練度", "備考", "操作"].map((header, index) => (
                  <th 
                    key={header} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" 
                    style={{ 
                      minWidth: index === 0 || index === 1 ? "200px" : ["110px", "100px", "120px", "120px", "110px", "100px", "120px"][index - 2] 
                    }} 
                    onClick={() => requestSort(["title", "artist", "tags", "genres", "youtubeUrl", "singingCount", "skillLevel", "memo", ""][index])}
                  >
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
                  className={`transition-colors duration-150 ease-in-out ${
                    activeRow === song.id ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({
                      x: e.pageX,
                      y: e.pageY,
                      song: song
                    });
                    setActiveRow(song.id);
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
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                    <div className="truncate">{song.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                    <div className="truncate">{song.artist}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.genre}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{song.tags.join(", ")}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {song.youtubeUrl ? (
                      <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-700">
                        <FontAwesomeIcon icon={faYoutube} size="lg" />
                      </a>
                    ) : (
                      "未登録"
                    )}
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
    </div>
  );
}

export default MainTable;
