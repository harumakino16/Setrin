import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import SongFieldModal from './SongFieldModal';
import { useSongs } from '../context/SongsContext';
import ContextMenu from './ContextMenu';
import ColumnSettingsModal from './ColumnSettingsModal';
import { useTheme } from '@/context/ThemeContext';
import { sortSongs } from '../utils/sortUtils';
import { convertUrlsToLinks } from '@/utils/textUtils';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

function MainTable({
  selectAll,
  handleSelectAll,
  selectedSongs,
  handleSelectSong,
  handleDeleteSong,
  tableData,
  setModalState,
  modalState,
  refreshSongs,
  onAddToSetlist,
  handleIncreaseSingingCount,
  handleDecreaseSingingCount,
  searchPerformed
}) {
  const { songs } = useSongs();
  const { theme } = useTheme();
  const { t } = useTranslation('common');
  const router = useRouter();
  const { locale } = router;
  const recordsPerPage = 30;
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSongs, setCurrentSongs] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const paginate = pageNumber => setCurrentPage(pageNumber);
  const [contextMenu, setContextMenu] = useState(null);
  const [activeRow, setActiveRow] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [headerMinWidths, setHeaderMinWidths] = useState({});
  const tableRef = useRef(null);
  const headerRefs = useRef({});
  const [resizing, setResizing] = useState({ isResizing: false, index: null, startX: 0, startWidth: 0 });

  const getInitialVisibleColumns = () => {
    const defaultColumns = {
      title: { label: 'songTitle', displayLabel: '', visible: true, removable: true },
      artist: { label: 'artist', displayLabel: '', visible: true, removable: true },
      genre: { label: 'genre', displayLabel: '', visible: true, removable: true },
      tags: { label: 'tag', displayLabel: '', visible: true, removable: true },
      youtubeUrl: { label: 'YouTube', displayLabel: 'YouTube', visible: true, removable: true },
      singingCount: { label: 'singingCount', displayLabel: '', visible: true, removable: true },
      skillLevel: { label: 'skillLevel', displayLabel: '', visible: true, removable: true },
      createdAt: { label: 'addedDate', displayLabel: '', visible: true, removable: true },
      note: { label: 'note', displayLabel: '', visible: true, removable: true },
      memo: { label: 'memo', displayLabel: '', visible: true, removable: true },
      actions: { label: 'actions', displayLabel: '', visible: true, removable: true }
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mainTableVisibleColumns');
      if (saved) {
        try {
          const parsedColumns = JSON.parse(saved);
          // 新しいカラムがLocalStorageに存在しない場合、デフォルト値をマージする
          // 既存のカラムの場合は、visibleとremovableのみを引き継ぎ、labelとdisplayLabelはデフォルト値を使用する
          const mergedColumns = { ...defaultColumns };
          Object.keys(parsedColumns).forEach(key => {
            if (mergedColumns[key]) {
              mergedColumns[key] = { 
                ...mergedColumns[key], 
                visible: parsedColumns[key].visible !== undefined ? parsedColumns[key].visible : mergedColumns[key].visible,
                removable: parsedColumns[key].removable !== undefined ? parsedColumns[key].removable : mergedColumns[key].removable
              };
            }
          });
          return mergedColumns;
        } catch (error) {
          console.error('Error parsing visibleColumns from localStorage:', error);
          return defaultColumns;
        }
      }
    }
    return defaultColumns;
  };

  const [visibleColumns, setVisibleColumns] = useState(getInitialVisibleColumns);

  // 翻訳が読み込まれた後にカラム名を更新
  useEffect(() => {
    console.log('Translation updated, updating column labels. Current locale:', locale);
    setVisibleColumns(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (key !== 'youtubeUrl') { // YouTubeは翻訳しない
          updated[key].displayLabel = t(updated[key].label);
        }
      });
      return updated;
    });
  }, [t, locale]);

  // コンポーネントマウント時にLocalStorageをクリアする（一時的な対応）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 古いフォーマットのデータを削除
      localStorage.removeItem('mainTableVisibleColumns');
      console.log('Cleared localStorage for mainTableVisibleColumns');
    }
  }, []);

  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const filteredData = tableData.filter(song => {
      return true;
    });
    
    const sortedData = sortSongs(filteredData, sortConfig);

    setCurrentSongs(sortedData.slice(indexOfFirstRecord, indexOfLastRecord));
  }, [tableData, currentPage, recordsPerPage, sortConfig]);

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

  const handleMouseDown = (e, key) => {
    e.preventDefault(); // テキスト選択を防止
    const startX = e.pageX;
    const headerCell = headerRefs.current[key];
    const startWidth = headerCell.offsetWidth;

    setResizing({
      isResizing: true,
      index: key,
      startX,
      startWidth,
    });
  };

  useLayoutEffect(() => {
    const newHeaderMinWidths = {};
    Object.keys(visibleColumns).forEach((key) => {
      const headerCell = headerRefs.current[key];
      if (headerCell) {
        const headerContent = headerCell.querySelector('.header-content');
        if (headerContent) {
          const minWidth = headerContent.offsetWidth + 20; // パディング分を追加
          newHeaderMinWidths[key] = minWidth;
        }
      }
    });
    setHeaderMinWidths(newHeaderMinWidths);
  }, [visibleColumns]);

  useEffect(() => {
    if (!resizing.isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.pageX - resizing.startX;
      const minWidth = headerMinWidths[resizing.index] || 50;
      const newWidth = Math.max(resizing.startWidth + deltaX, minWidth);
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
  }, [resizing, headerMinWidths]);

  const toggleColumnVisibility = (columnKey) => {
    if (visibleColumns[columnKey].removable) {
      setVisibleColumns(prev => ({
        ...prev,
        [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible }
      }));
    }
  };

  useEffect(() => {
    const totalPages = Math.ceil(tableData.length / recordsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [tableData.length, currentPage, recordsPerPage]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedSongs = [...currentSongs].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setCurrentSongs(sortedSongs);
  };

  // LocalStorageに保存する際は、displayLabelを除外する
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // displayLabelを除外したオブジェクトを作成
      const storageColumns = {};
      Object.keys(visibleColumns).forEach(key => {
        const { displayLabel, ...rest } = visibleColumns[key];
        storageColumns[key] = rest;
      });
      localStorage.setItem('mainTableVisibleColumns', JSON.stringify(storageColumns));
    }
  }, [visibleColumns]);

  return (
    <div>
      {currentSongs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">{t('noSongsRegistered')}</p>
          <button onClick={() => setModalState({ ...modalState, addSong: true })} className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded`}>
            {t('addSong')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-scroll">
          <table ref={tableRef} className="whitespace-nowrap w-full rounded-lg overflow-hidden" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '50px' }} />
              {Object.entries(visibleColumns).map(([key, { visible }]) =>
                visible && (
                  <col key={key} style={{ width: columnWidths[key] || 'auto', minWidth: `${headerMinWidths[key] || 100}px` }} />
                )
              )}
            </colgroup>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r" style={{ position: 'relative', minWidth: '30px' }}>
                  <input className="w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300 cursor-pointer" type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                </th>
                {Object.entries(visibleColumns).map(([key, { label, visible, displayLabel }]) =>
                  visible && (
                    <th
                      ref={el => { headerRefs.current[key] = el; }}
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative border-r"
                    >
                      <div className="flex items-center cursor-pointer header-content" onClick={() => requestSort(key)}>
                        <span>
                          {key === 'youtubeUrl' 
                            ? label 
                            : (displayLabel || t(label))}
                        </span>
                        <FontAwesomeIcon
                          icon={
                            sortConfig.key === key
                              ? sortConfig.direction === 'ascending'
                                ? faSortUp
                                : faSortDown
                              : faSort
                          }
                          className="ml-2"
                        />
                      </div>
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
                        t('notRegistered')
                      )}
                    </td>
                  )}
                  {visibleColumns.singingCount.visible && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{song.singingCount}</span>
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => handleIncreaseSingingCount(song.id)}
                            className="text-gray-500 hover:text-gray-700 p-0 m-0 mt-1"
                            style={{ fontSize: '0.5rem' }}
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleDecreaseSingingCount(song.id)}
                            className="text-gray-500 hover:text-gray-700 p-0 m-0"
                            style={{ fontSize: '0.5rem' }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.skillLevel.visible && (
                    <td className="px-6 py-4 whitespace-nowrap">{song.skillLevel}</td>
                  )}
                  {visibleColumns.createdAt.visible && (
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {song.createdAt ? new Date(song.createdAt.seconds * 1000).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : t('notSet')}
                    </td>
                  )}
                  {visibleColumns.note.visible && (
                    <td className="px-6 py-4 whitespace-normal break-words text-sm">
                      <div 
                        className="max-h-[4.5rem] overflow-y-auto whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: convertUrlsToLinks(song.note) 
                        }} 
                      />
                    </td>
                  )}
                  {visibleColumns.memo.visible && (
                    <td className="px-6 py-4 whitespace-normal break-words text-sm">
                      <div 
                        className="max-h-[4.5rem] overflow-y-auto whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: convertUrlsToLinks(song.memo) 
                        }} 
                      />
                    </td>
                  )}
                  {visibleColumns.actions.visible && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleEditSong(song.id)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">{t('edit')}</button>
                      <button onClick={() => handleDeleteSong(song.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">{t('delete')}</button>
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
          {Array.from({ length: Math.ceil(tableData.length / recordsPerPage) }, (_, i) => i + 1).length > 10 ? (
            <>
              <button onClick={() => paginate(1)} className={`px-4 py-2 ${currentPage === 1 ? `bg-customTheme-${theme}-primary text-white` : `bg-white text-customTheme-${theme}-primary`} border rounded`}>
                1
              </button>
              {currentPage > 3 && <span className="px-2 py-2">...</span>}
              {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
                .filter(page => page > 1 && page < Math.ceil(tableData.length / recordsPerPage))
                .map(page => (
                  <button key={page} onClick={() => paginate(page)} className={`px-4 py-2 ${currentPage === page ? `bg-customTheme-${theme}-primary text-white` : `bg-white text-customTheme-${theme}-primary`} border rounded`}>
                    {page}
                  </button>
                ))}
              {currentPage < Math.ceil(tableData.length / recordsPerPage) - 2 && <span className="px-2 py-2">...</span>}
              <button onClick={() => paginate(Math.ceil(tableData.length / recordsPerPage))} className={`px-4 py-2 ${currentPage === Math.ceil(tableData.length / recordsPerPage) ? `bg-customTheme-${theme}-primary text-white` : `bg-white text-customTheme-${theme}-primary`} border rounded`}>
                {Math.ceil(tableData.length / recordsPerPage)}
              </button>
            </>
          ) : (
            Array.from({ length: Math.ceil(tableData.length / recordsPerPage) }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => paginate(page)} className={`px-4 py-2 ${currentPage === page ? `bg-customTheme-${theme}-primary text-white` : `bg-white text-customTheme-${theme}-primary`} border rounded`}>
                {page}
              </button>
            ))
          )}
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
