import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, writeBatch, increment } from 'firebase/firestore';
import { useMessage } from "@/context/MessageContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/context/ThemeContext';
import { convertUrlsToLinks } from '@/utils/textUtils';

const SetlistTable = ({ currentSongs, setCurrentSongs, currentUser, setlist, visibleColumns, setVisibleColumns }) => {
  const [isDragged, setIsDragged] = useState(false);
  const { setMessageInfo } = useMessage();
  const { theme } = useTheme();

  const [columnWidths, setColumnWidths] = useState({});
  const tableRef = useRef(null);
  const headerRefs = useRef([]);
  const [resizing, setResizing] = useState({
    isResizing: false,
    key: null,
    startX: 0,
    startWidth: 0,
  });

  // headerRefsの初期化
  useEffect(() => {
    headerRefs.current = headerRefs.current.slice(0, Object.keys(visibleColumns).length + 2);
  }, [visibleColumns]);

  const handleColumnResize = (key, newWidth) => {
    setColumnWidths((prev) => ({
      ...prev,
      [key]: newWidth,
    }));
  };

  const onSave = async () => {
    try {
      const batch = writeBatch(db);
      const setlistDocRef = doc(
        db,
        `users/${currentUser.uid}/Setlists/${setlist.id}`
      );
      const songIds = currentSongs.map((song) => song.id);
      batch.update(setlistDocRef, { songIds });
      await batch.commit();

      setMessageInfo({
        message: 'セットリストが保存されました',
        type: 'success',
      });

      setIsDragged(false); // ドラッグ状態をリセット
    } catch (error) {
      // エラーハンドリング
    }
  };

  const onDelete = async (songId) => {
    try {
      const setlistDocRef = doc(
        db,
        `users/${currentUser.uid}/Setlists/${setlist.id}`
      );

      const setlistSnapshot = await getDoc(setlistDocRef);
      if (setlistSnapshot.exists()) {
        const setlistData = setlistSnapshot.data();

        const updatedSongIds = setlistData.songIds.filter(
          (id) => id !== songId
        );

        await updateDoc(setlistDocRef, { songIds: updatedSongIds });

        const updatedSongs = currentSongs.filter((song) => song.id !== songId);
        setCurrentSongs(updatedSongs);

        setMessageInfo({ message: '曲が削除されました', type: 'success' });
      } else {
        setMessageInfo({
          message: 'セットリストが存在しません',
          type: 'error',
        });
      }
    } catch (error) {
      // エラーハンドリング
    }
  };

  const [saveTrigger, setSaveTrigger] = useState(false);

  useEffect(() => {
    if (saveTrigger) {
      onSave();
      setSaveTrigger(false);
    }
  }, [saveTrigger, currentSongs]);

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRow = currentSongs[dragIndex];
    const newSongs = [...currentSongs];
    newSongs.splice(dragIndex, 1);
    newSongs.splice(hoverIndex, 0, dragRow);
    setCurrentSongs(newSongs);
    setIsDragged(true); // ドラッグ操作があったことを記録
  };

  const handleSaveButton = () => {
    setSaveTrigger(true); // 保存トリガーを設定
  };

  const handleIncreaseSingingCount = async (songId) => {
    try {
      // ローカルの状態を更新
      setCurrentSongs(prevSongs =>
        prevSongs.map(song =>
          song.id === songId ? { ...song, singingCount: song.singingCount + 1 } : song
        )
      );
      
      // Firestoreのsongドキュメントを更新
      const songDocRef = doc(db, `users/${currentUser.uid}/Songs/${songId}`);
      await updateDoc(songDocRef, {
        singingCount: increment(1)
      });
    } catch (error) {
      // エラーハンドリング
      setMessageInfo({ message: '歌唱回数の更新に失敗しました', type: 'error' });
    }
  };

  const handleDecreaseSingingCount = async (songId) => {
    try {
      // ローカルの状態を更新
      setCurrentSongs(prevSongs =>
        prevSongs.map(song =>
          song.id === songId ? { ...song, singingCount: Math.max(song.singingCount - 1, 0) } : song
        )
      );
      
      // Firestoreのsongドキュメントを更新
      const songDocRef = doc(db, `users/${currentUser.uid}/Songs/${songId}`);
      await updateDoc(songDocRef, {
        singingCount: increment(-1)
      });
    } catch (error) {
      // エラーハンドリング
      setMessageInfo({ message: '歌唱回数の更新に失敗しました', type: 'error' });
    }
  };

  const increaseAllSingingCounts = async () => {
    try {
      // ローカルの状態を更新
      setCurrentSongs(prevSongs =>
        prevSongs.map(song => ({ ...song, singingCount: song.singingCount + 1 }))
      );
      
      // Firestoreのsongドキュメントをバッチ更新
      const batch = writeBatch(db);
      currentSongs.forEach(song => {
        const songDocRef = doc(db, `users/${currentUser.uid}/Songs/${song.id}`);
        batch.update(songDocRef, { singingCount: increment(1) });
      });
      await batch.commit();
    } catch (error) {
      // エラーハンドリング
      setMessageInfo({ message: '歌唱回数の一括更新に失敗しました', type: 'error' });
    }
  };

  const decreaseAllSingingCounts = async () => {
    try {
      // ローカルの状態を更新
      setCurrentSongs(prevSongs =>
        prevSongs.map(song => ({ ...song, singingCount: Math.max(song.singingCount - 1, 0) }))
      );
      
      // Firestoreのsongドキュメントをバッチ更新
      const batch = writeBatch(db);
      currentSongs.forEach(song => {
        const songDocRef = doc(db, `users/${currentUser.uid}/Songs/${song.id}`);
        batch.update(songDocRef, { singingCount: increment(-1) });
      });
      await batch.commit();
    } catch (error) {
      // エラーハンドリング
      setMessageInfo({ message: '歌唱回数の一括更新に失敗しました', type: 'error' });
    }
  };

  const Row = ({ song, index }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
      accept: 'row',
      hover(item, monitor) {
        if (!ref.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) {
          return;
        }
        moveRow(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    const [{ isDragging }, drag, preview] = useDrag({
      type: 'row',
      item: () => {
        return { id: song.id, index };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    preview(drop(ref));

    return (
      <tr
        ref={ref}
        style={{ opacity: isDragging ? 0 : 1 }}
        className="bg-white hover:bg-gray-50 transition-colors duration-150 ease-in-out"
      >
        <td className="border-b border-gray-200 px-4 py-3">
          <div ref={drag} style={{ cursor: 'move' }} className="flex justify-center">
            <FontAwesomeIcon icon={faBars} className="text-gray-400 hover:text-gray-600" />
          </div>
        </td>
        {visibleColumns.order.visible && (
          <td className="border-b border-gray-200 px-4 py-3 text-center font-medium text-gray-500">{index + 1}</td>
        )}
        {visibleColumns.title.visible && (
          <td className="border-b border-gray-200 px-4 py-3 max-w-xs">
            {song.youtubeUrl ? (
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                <div className="truncate">{song.title}</div>
              </a>
            ) : (
              <div className="truncate text-gray-900 font-medium">{song.title}</div>
            )}
          </td>
        )}
        {visibleColumns.artist.visible && (
          <td className="border-b border-gray-200 px-4 py-3 max-w-xs">
            <div className="truncate text-gray-700">{song.artist}</div>
          </td>
        )}
        {visibleColumns.genre.visible && (
          <td className="border-b border-gray-200 px-4 py-3 max-w-xs">
            <div className="truncate text-gray-700">{song.genre}</div>
          </td>
        )}
        {visibleColumns.tags.visible && (
          <td className="border-b border-gray-200 px-4 py-3 max-w-xs">
            <div className="truncate text-gray-600">{song.tags.join(', ')}</div>
          </td>
        )}
        {visibleColumns.singingCount.visible && (
          <td className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <span className="font-medium text-gray-700">{song.singingCount}</span>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleIncreaseSingingCount(song.id)}
                  className="text-gray-400 hover:text-gray-600 p-0 m-0 mt-1 transition-colors"
                  style={{ fontSize: '0.5rem' }}
                >
                  ▲
                </button>
                <button
                  onClick={() => handleDecreaseSingingCount(song.id)}
                  className="text-gray-400 hover:text-gray-600 p-0 m-0 transition-colors"
                  style={{ fontSize: '0.5rem' }}
                >
                  ▼
                </button>
              </div>
            </div>
          </td>
        )}
        {visibleColumns.skillLevel.visible && (
          <td className="border-b border-gray-200 px-4 py-3 text-center font-medium text-gray-700">{song.skillLevel || '0'}</td>
        )}
        {visibleColumns.note?.visible && (
          <td className="border-b border-gray-200 px-6 py-4 whitespace-normal break-words text-sm text-gray-600">
            <div 
              className="max-h-[4.5rem] overflow-y-auto whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: convertUrlsToLinks(song.note) 
              }} 
            />
          </td>
        )}
        {visibleColumns.memo?.visible && (
          <td className="border-b border-gray-200 px-6 py-4 whitespace-normal break-words text-sm text-gray-600">
            <div 
              className="max-h-[4.5rem] overflow-y-auto whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: convertUrlsToLinks(song.memo) 
              }} 
            />
          </td>
        )}
        {visibleColumns.delete.visible && (
          <td className="border-b border-gray-200 px-4 py-3">
            <div className="flex justify-center whitespace-nowrap">
              <button
                onClick={() => onDelete(song.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded-md transition-colors shadow-sm hover:shadow whitespace-nowrap min-w-[60px]"
              >
                削除
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  };

  const handleMouseDown = (e, key) => {
    e.preventDefault();
    const headerCell = headerRefs.current[key];
    if (!headerCell) return;

    const startX = e.clientX;
    const startWidth = headerCell.offsetWidth;

    setResizing({
      isResizing: true,
      key,
      startX,
      startWidth,
    });
  };

  useEffect(() => {
    if (!resizing.isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizing.startX;
      const newWidth = Math.max(resizing.startWidth + deltaX, 100);
      setColumnWidths((prev) => ({
        ...prev,
        [resizing.key]: `${newWidth}px`,
      }));
    };

    const handleMouseUp = () => {
      setResizing({ isResizing: false, key: null, startX: 0, startWidth: 0 });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  return (
    <div className="overflow-x-auto w-full">
      <table
        ref={tableRef}
        className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg overflow-hidden"
      >
        <colgroup>
          <col style={{ width: '30px' }} />
          {visibleColumns.order.visible && <col style={{ width: '40px' }} />}
          {Object.entries(visibleColumns).map(([key, { visible }]) => (
            visible && <col key={key} style={{ width: columnWidths[key] || 'auto' }} />
          ))}
        </colgroup>
        <thead className="bg-gray-50">
          <tr>
            {/* ドラッグハンドル列 */}
            <th
              className="px-4 py-3 relative border-b border-gray-200 bg-gray-50"
              style={{ width: '30px' }}
            >
              {/* ここにドラッグハンドルのアイコン等を追加可能 */}
            </th>
            {/* 順番列 */}
            {visibleColumns.order.visible && (
              <th
                ref={(el) => (headerRefs.current['order'] = el)}
                className="px-4 py-3 relative border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                style={{ width: '40px' }}
              >
                順番
                <div
                  className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize"
                  onMouseDown={(e) => handleMouseDown(e, 'order')}
                />
              </th>
            )}
            {/* その他の列 */}
            {Object.entries(visibleColumns).map(([key, { label, visible }]) => {
              if (key === 'order') return null;
              if (!visible) return null;
              return (
                <th
                  key={key}
                  ref={(el) => (headerRefs.current[key] = el)}
                  className="px-4 py-3 relative border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  style={{
                    width: columnWidths[key] || 'auto',
                    minWidth: '50px',
                  }}
                >
                  <div className="flex items-center justify-center">
                    <span className="whitespace-nowrap">{label}</span>
                    {key === 'singingCount' && (
                      <div className="flex flex-col items-center ml-2">
                        <button
                          onClick={increaseAllSingingCounts}
                          className="text-gray-400 hover:text-gray-600 p-0 m-0 mt-1 transition-colors"
                          style={{ fontSize: '0.5rem' }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={decreaseAllSingingCounts}
                          className="text-gray-400 hover:text-gray-600 p-0 m-0 transition-colors"
                          style={{ fontSize: '0.5rem' }}
                        >
                          ▼
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-gray-300"
                    onMouseDown={(e) => handleMouseDown(e, key)}
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {currentSongs.map((song, index) => (
            <Row key={song.id} song={song} index={index} />
          ))}
        </tbody>
      </table>
      {isDragged && (
        <div className={`fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200 flex justify-between items-center z-50`}>
          <div className="text-gray-700">
            <span className="font-medium">未保存の変更があります。</span>
            <span className="ml-2">変更を保存するには「変更を保存」ボタンを押してください。</span>
          </div>
          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition-colors shadow-sm hover:shadow"
          >
            変更を保存
          </button>
        </div>
      )}
    </div>
  );
};

export default SetlistTable;
