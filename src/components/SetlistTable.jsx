import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useMessage } from "@/context/MessageContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const SetlistTable = ({ currentSongs, setCurrentSongs, currentUser, setlist }) => {
  const [isDragged, setIsDragged] = useState(false);
  const { setMessageInfo } = useMessage();

  const [columnWidths, setColumnWidths] = useState({});
  const tableRef = useRef(null);
  const headerRefs = useRef([]);
  const [resizing, setResizing] = useState({
    isResizing: false,
    index: null,
    startX: 0,
    startWidth: 0,
  });

  // headerRefsの初期化
  useEffect(() => {
    headerRefs.current = headerRefs.current.slice(0, 10);
  }, []);

  const handleColumnResize = (index, newWidth) => {
    setColumnWidths((prev) => ({
      ...prev,
      [index]: newWidth,
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
        className="bg-white"
      >
        <td className="border px-4 py-2">
          <div ref={drag} style={{ cursor: 'move' }}>
            <FontAwesomeIcon icon={faBars} />
          </div>
        </td>
        <td className="border px-4 py-2">{index + 1}</td>
        <td className="border px-4 py-2 max-w-xs">
          <a
            href={song.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            <div className="truncate">{song.title}</div>
          </a>
        </td>
        <td className="border px-4 py-2 max-w-xs">
          <div className="truncate">{song.artist}</div>
        </td>
        <td className="border px-4 py-2 max-w-xs">
          <div className="truncate">{song.genre}</div>
        </td>
        <td className="border px-4 py-2 max-w-xs">
          <div className="truncate">{song.tags.join(', ')}</div>
        </td>
        <td className="border px-4 py-2">{song.singingCount}</td>
        <td className="border px-4 py-2">{song.skillLevel || '0'}</td>
        <td className="border px-4 py-2">{song.memo}</td>
        <td className="border px-4 py-2">
          <button
            onClick={() => onDelete(song.id)}
            className="text-red-500 hover:text-red-700"
          >
            削除
          </button>
        </td>
      </tr>
    );
  };

  const handleMouseDown = (e, index) => {
    e.preventDefault();
    const headerCell = headerRefs.current[index];
    if (!headerCell) return; // headerCellが存在しない場合は処理を中断

    const startX = e.clientX; // マウスの位置を取得
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
      const deltaX = e.clientX - resizing.startX;
      const newWidth = Math.max(resizing.startWidth + deltaX, 100);
      setColumnWidths((prev) => ({
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

  return (
    <div className="overflow-x-auto w-full">
      <table
        ref={tableRef}
        className="whitespace-nowrap w-full table-fixed"
      >
        <colgroup>
          <col style={{ width: '30px' }} />
          <col style={{ width: '40px' }} />
          {[...Array(8)].map((_, index) => (
            <col key={index} style={{ width: columnWidths[index + 2] || 'auto' }} />
          ))}
        </colgroup>
        <thead className="bg-gray-200">
          <tr>
            {[
              '',
              '順番',
              '曲名',
              'アーティスト',
              'ジャンル',
              'タグ',
              '歌唱回数',
              '熟練度',
              '備考',
              '削除',
            ].map((header, index) => (
              <th
                key={header}
                ref={(el) => (headerRefs.current[index] = el)}
                className="px-4 py-2 relative border-r border-white last:border-r-0"
                style={{
                  width: index < 2 ? '40px' : (columnWidths[index] || (index === 2 || index === 3 ? '200px' : '100px')),
                  minWidth: index < 2 ? '40px' : '50px',
                }}
              >
                {header}
                {index >= 2 && (
                  <div
                    className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize"
                    onMouseDown={(e) => handleMouseDown(e, index)}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentSongs.map((song, index) => (
            <Row key={song.id} song={song} index={index} />
          ))}
        </tbody>
      </table>
      {isDragged && (
        <button
          onClick={onSave}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '50%',
            transform: 'translateX(50%)',
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-40 rounded"
        >
          変更を保存する
        </button>
      )}
    </div>
  );
};

export default SetlistTable;
