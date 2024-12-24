import React, { useState, useContext } from 'react';
import { db } from '@/../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

function BulkEditModal({ isOpen, onClose, selectedSongs, songs, refreshSongs }) {
  const { currentUser } = useContext(AuthContext);
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    genre: '',
    tags: '',
    singingCount: '',
    skillLevel: '',
    memo: ''
  });
  const [tagUpdateMode, setTagUpdateMode] = useState('add');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updates = {};
      if (formData.genre) updates.genre = formData.genre;
      if (formData.singingCount) updates.singingCount = parseInt(formData.singingCount);
      if (formData.skillLevel) updates.skillLevel = parseInt(formData.skillLevel);
      if (formData.memo) updates.memo = formData.memo;

      // タグの処理
      const newTags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      const updatePromises = selectedSongs.map(async songId => {
        const songRef = doc(db, 'users', currentUser.uid, 'Songs', songId);
        const currentSong = songs.find(s => s.id === songId);
        
        if (formData.tags) {
          if (tagUpdateMode === 'add') {
            // 既存のタグと新しいタグを結合し、重複を除去
            const combinedTags = [...new Set([...(currentSong.tags || []), ...newTags])];
            updates.tags = combinedTags;
          } else {
            // 完全に置き換え
            updates.tags = newTags;
          }
        }

        return updateDoc(songRef, updates);
      });

      await Promise.all(updatePromises);
      refreshSongs();
      onClose();
    } catch (error) {
      console.error('Error updating songs:', error);
      alert('曲の更新中にエラーが発生しました。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">複数の曲を一括編集</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">ジャンル</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">タグ (カンマ区切り)</label>
            <div className="space-y-2">
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tagUpdateMode"
                    value="add"
                    checked={tagUpdateMode === 'add'}
                    onChange={(e) => setTagUpdateMode(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">既存のタグに追加</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tagUpdateMode"
                    value="replace"
                    checked={tagUpdateMode === 'replace'}
                    onChange={(e) => setTagUpdateMode(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">タグを置き換え</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">歌唱回数</label>
            <input
              type="number"
              name="singingCount"
              value={formData.singingCount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">熟練度</label>
            <input
              type="number"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">備考</label>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded inline-flex items-center`}
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BulkEditModal; 