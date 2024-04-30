import React, { useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const SongTable = ({ songs, setSongs, onDelete, pageName }) => {
  const isSetlistHistoryDetail = pageName === 'setlisthistory/[id]';

  const renderOperations = (song) => (
    <td className="border px-4 py-2">
      {onDelete && <button className="bg-red-500 text-white px-3 py-1 rounded mr-2" onClick={() => onDelete(song.id)}>削除</button>}
    </td>
  );

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRow = songs[dragIndex];
    const newSongs = [...songs];
    newSongs.splice(dragIndex, 1);
    newSongs.splice(hoverIndex, 0, dragRow);
    setSongs(newSongs);
    // ここで新しい順序を親コンポーネントまたは状態に通知する
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

    return (
      <tr ref={ref} style={{ opacity: isDragging ? 0 : 1, cursor: 'grab' }} className="bg-white">
        <td className="border px-4 py-2">{index + 1}</td>
        <td className="border px-4 py-2">{song.title}</td>
        <td className="border px-4 py-2">{song.artist}</td>
        <td className="border px-4 py-2">{song.timesSung}</td>
        <td className="border px-4 py-2">
          <span className={song.monetized ? "text-green-500" : "text-red-500"}>
            {song.monetized ? '〇' : '×'}
          </span>
        </td>
        <td className="border px-4 py-2">{song.skillLevel || '0'}</td>
        {!isSetlistHistoryDetail && renderOperations(index, song)}
      </tr>
    );
  };

  return (
    <table className="table-auto w-full">
      <thead className="bg-gray-200 sticky top-0">
        <tr>
          <th className="px-4 py-2">順番</th>
          <th className="px-4 py-2">曲名</th>
          <th className="px-4 py-2">アーティスト</th>
          <th className="px-4 py-2">歌唱回数</th>
          <th className="px-4 py-2">収益化</th>
          <th className="px-4 py-2">熟練度</th>
          {!isSetlistHistoryDetail && <th className="px-4 py-2">削除</th>}
        </tr>
      </thead>
      <tbody>
        {songs.map((song, index) => (
          <Row key={song.id} song={song} index={index} />
        ))}
      </tbody>
    </table>
  );
};

export default SongTable;