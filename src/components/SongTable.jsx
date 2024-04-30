import React, { useEffect } from 'react';

const SongTable = ({ songs, onEdit, onDelete, onMoveUp, onMoveDown, pageName, refreshSongs }) => {
  const isSetlistHistoryDetail = pageName === 'setlisthistory/[id]';

  useEffect(() => {
    if (refreshSongs) {
      refreshSongs(); // 初回マウント時にデータをリフレッシュ
    }
  }, [refreshSongs]); // refreshSongsが更新された時のみリフレッシュをトリガー

  const renderOperations = (index, song) => (
    <>
      <td className="border px-4 py-2">
        {onMoveUp && <button className="bg-gray-300 text-black px-3 py-1 rounded mr-2" onClick={() => onMoveUp(index)}>上に移動</button>}
        {onMoveDown && <button className="bg-gray-300 text-black px-3 py-1 rounded" onClick={() => onMoveDown(index)}>下に移動</button>}
      </td>
      <td className="border px-4 py-2">
        {onDelete && <button className="bg-red-500 text-white px-3 py-1 rounded mr-2" onClick={() => onDelete(song.id)}>削除</button>}
      </td>
    </>
  );

  return (
    <table className="table-auto w-full">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2">順番</th>
          <th className="px-4 py-2">曲名</th>
          <th className="px-4 py-2">アーティスト</th>
          <th className="px-4 py-2">歌唱回数</th>
          <th className="px-4 py-2">収益化</th>
          <th className="px-4 py-2">熟練度</th>
          {!isSetlistHistoryDetail && <th className="px-4 py-2">操作</th>}
          {!isSetlistHistoryDetail && <th className="px-4 py-2">削除</th>}
        </tr>
      </thead>
      <tbody>
        {songs.map((song, index) => (
          <tr key={index} className="bg-white">
            <td className="border px-4 py-2">{index + 1}</td>
            <td className="border px-4 py-2">{song.title}</td>
            <td className="border px-4 py-2">{song.artist}</td>
            <td className="border px-4 py-2">{song.timesSung}</td>
            <td className="border px-4 py-2">
              <span className={song.monetized ? "text-green-500" : "text-red-500"}>
                {song.monetized ? '〇' : '×'}
              </span>
            </td>
            <td className="border px-4 py-2">{song.skillLevel}</td>
            {!isSetlistHistoryDetail && renderOperations(index, song)}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SongTable;