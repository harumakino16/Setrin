import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faYoutube } from '@fortawesome/free-brands-svg-icons';
import SongFieldModal from './SongFieldModal';
import { useSongs } from '../context/SongsContext';
import ContextMenu from './ContextMenu';
import ColumnSettingsModal from './ColumnSettingsModal';
import { FaPen } from 'react-icons/fa';

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
  const [activeRow, setActiveRow] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});
  const tableRef = useRef(null);
  const headerRefs = useRef([]);
  const [resizing, setResizing] = useState({ isResizing: false, index: null, startX: 0, startWidth: 0 });
  const [visibleColumns, setVisibleColumns] = useState({
    title: { label: '曲名', visible: true, removable: true },
    artist: { label: 'アーティスト', visible: true, removable: true },
    genre: { label: 'ジャンル', visible: true, removable: true },
    tags: { label: 'タグ', visible: true, removable: true },
    youtubeUrl: { label: 'YouTube', visible: true, removable: true },
    singingCount: { label: '歌唱回数', visible: true, removable: true },
    skillLevel: { label: '熟練度', visible: true, removable: true },
    memo: { label: '備考', visible: true, removable: true },
    actions: { label: '操作', visible: true, removable: true }
  });

  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setCurrentSongs(tableData.slice(indexOfFirstRecord, indexOfLastRecord));
  }, [tableData, currentPage, recordsPerPage]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setActiveRow(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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

  const handleMouseDown = (e, index) => {
    e.preventDefault(); // テキスト選択を防止
    const startX = e.pageX;
    const headerCell = headerRefs.current[index];
    const startWidth = headerCell.offsetWidth;

    setResizing({
      isResizing: true,
      index,
      startX,
      startWidth,
    });
  };

  useEffect(() => {
    if (!resizing.isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.pageX - resizing.startX;
      const newWidth = Math.max(resizing.startWidth + deltaX, 50); // 最小幅を50pxに設定
      setColumnWidths(prev => ({
        ...prev,
        [resizing.index]: `${newWidth}px`,
      }));
    };

    const handleMouseUp = () => {
      setResizing({ isResizing: false, index: null, startX: 0, startWidth: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  const toggleColumnVisibility = (columnKey) => {
    if (visibleColumns[columnKey].removable) {
      setVisibleColumns(prev => ({
        ...prev,
        [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible }
      }));
    }
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
          <table ref={tableRef} className="whitespace-nowrap w-full" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '50px' }} />
              {Object.entries(visibleColumns).map(([key, { visible }]) =>
                visible && <col key={key} style={{ width: columnWidths[key] || 'auto', minWidth: '100px' }} />
              )}
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r" style={{ position: 'relative', top: '2px', minWidth: '30px' }}>
                  <input className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 cursor-pointer" type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                {Object.entries(visibleColumns).map(([key, { label, visible }]) =>
                  visible && (
                    <th
                      key={key}
                      ref={el => headerRefs.current[key] = el}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative border-r"
                    >
                      <span className="cursor-pointer">
                        {label}
                        <FontAwesomeIcon icon={faSort} className="ml-2" />
                      </span>
                      <div
                        className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize"
                        onMouseDown={(e) => handleMouseDown(e, key)}
                      />
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentSongs.map((song, index) => (
                <tr
                  key={index}
                  className={`transition-colors duration-150 ease-in-out ${activeRow === song.id ? 'bg-gray-100' : 'hover:bg-gray-100'
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
                  {visibleColumns.title.visible && (
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="truncate">{song.title}</div>
                    </td>
                  )}
                  {visibleColumns.artist.visible && (
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="truncate">{song.artist}</div>
                    </td>
                  )}
                  {visibleColumns.genre.visible && (
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="truncate">{song.genre}</div>
                    </td>
                  )}
                  {visibleColumns.tags.visible && (
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                      <div className="truncate">{song.tags.join(", ")}</div>
                    </td>
                  )}
                  {visibleColumns.youtubeUrl.visible && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {song.youtubeUrl ? (
                        <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-700">
                          <FontAwesomeIcon icon={faYoutube} size="lg" />
                        </a>
                      ) : (
                        "未登録"
                      )}
                    </td>
                  )}
                  {visibleColumns.singingCount.visible && (
                    <td className="px-6 py-4 whitespace-nowrap">{song.singingCount}</td>
                  )}
                  {visibleColumns.skillLevel.visible && (
                    <td className="px-6 py-4 whitespace-nowrap">{song.skillLevel}</td>
                  )}
                  {visibleColumns.memo.visible && (
                    <td className="px-6 py-4 whitespace-nowrap">{song.memo}</td>
                  )}
                  {visibleColumns.actions.visible && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleEditSong(song.id)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">編集</button>
                      <button onClick={() => handleDeleteSong(song.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">削除</button>
                    </td>
                  )}
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

      <ColumnSettingsModal
        isOpen={modalState.columnSettings}
        onClose={() => setModalState(prev => ({ ...prev, columnSettings: false }))}
        visibleColumns={visibleColumns}
        toggleColumnVisibility={toggleColumnVisibility}
      />
    </div>
  );
}

export default MainTable;
