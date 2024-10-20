import React from 'react';
import { FaPen, FaTrash, FaFolderPlus } from 'react-icons/fa';

const ContextMenu = ({ x, y, onEdit, onDelete, onAddToSetlist, onClose }) => {
  return (
    <div
      className="absolute bg-white border border-gray-300 shadow-md rounded-md py-2"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
        onClick={onAddToSetlist}
      >
        <FaFolderPlus className="mr-2" />
        セットリストに追加
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
        onClick={onEdit}
      >
        <FaPen className="mr-2" />
        編集
      </button>
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
        onClick={onDelete}
      >
        <FaTrash className="mr-2" />
        削除
      </button>
    </div>
  );
};

export default ContextMenu;
