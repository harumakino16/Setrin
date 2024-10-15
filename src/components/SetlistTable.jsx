import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useMessage } from "@/context/MessageContext";
import Link from 'next/link';

const SetlistTable = ({ currentSongs, setCurrentSongs, currentUser, setlist }) => {
  const [isDragged, setIsDragged] = useState(false);
  const { setMessageInfo } = useMessage();

  const onSave = async () => {
    try {
      const batch = writeBatch(db);
      const setlistDocRef = doc(db, `users/${currentUser.uid}/Setlists/${setlist.id}`);
      const songIds = currentSongs.map(song => song.id);
      batch.update(setlistDocRef, { songIds });
      await batch.commit();
      
      
      setMessageInfo({ message: 'セットリストが保存されました', type: 'success' });

      setIsDragged(false); // ドラッグ状態をリセット
    } catch (error) {
      
    }
  };

  const onDelete = async (songId) => {
    try {
      // setlist 文書の参照を取得
      const setlistDocRef = doc(db, `users/${currentUser.uid}/Setlists/${setlist.id}`);

      // 文書の現在のデータを取得
      const setlistSnapshot = await getDoc(setlistDocRef);
      if (setlistSnapshot.exists()) {
        const setlistData = setlistSnapshot.data();

        // 曲IDリストから指定された曲IDを削除
        const updatedSongIds = setlistData.songIds.filter(id => id !== songId);

        // Firestore のセットリストを更新
        await updateDoc(setlistDocRef, { songIds: updatedSongIds });

        // ローカルステートを更新
        const updatedSongs = currentSongs.filter(song => song.id !== songId);
        setCurrentSongs(updatedSongs);
        
        setMessageInfo({ message: '曲が削除されました', type: 'success' });
      } else {
        
        setMessageInfo({ message: 'セットリストが存在しません', type: 'error' });
      }
    } catch (error) {
      
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

    const [{ isDragging }, drag] = useDrag({
      type: 'row',
      item: () => {
        return { id: song.id, index };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    drag(drop(ref));

    const truncateText = (text, maxLength) => {
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    return (
      <tr ref={ref} style={{ opacity: isDragging ? 0 : 1, cursor: 'grab' }} className="bg-white">
        <td className="border px-4 py-2">{index + 1}</td>
        <td className="border px-4 py-2">{truncateText(song.title, 15)}</td>
        <td className="border px-4 py-2">{truncateText(song.artist, 15)}</td>
        <td className="border px-4 py-2">{song.genre}</td>
        <td className="border px-4 py-2">{song.tags.join(', ')}</td>
        <td className="border px-4 py-2">{song.singingCount}</td>
        <td className="border px-4 py-2">{song.skillLevel || '0'}</td>
        <td className="border px-4 py-2">{song.memo}</td>
        <td className="border px-4 py-2">
          <a href={song.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {song.youtubeUrl}
          </a>
        </td>
        <td className="border px-4 py-2">
          <button onClick={() => onDelete(song.id)} className="text-red-500 hover:text-red-7000">
            削除
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="whitespace-nowrap w-full">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">順番</th>
            <th className="px-4 py-2">曲名</th>
            <th className="px-4 py-2">アーティスト</th>
            <th className="px-4 py-2">ジャンル</th>
            <th className="px-4 py-2">タグ</th>
            <th className="px-4 py-2">歌唱回数</th>
            <th className="px-4 py-2">熟練度</th>
            <th className="px-4 py-2">備考</th>
            <th className="px-4 py-2">URL</th>
            <th className="px-4 py-2">削除</th>
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
          style={{ position: 'fixed', bottom: '20px', right: '50%', transform: 'translateX(50%)' }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-40 rounded"
        >
          変更を保存する
        </button>
      )}
    </div>
  );
};

export default SetlistTable;
