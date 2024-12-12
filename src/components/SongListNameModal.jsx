import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';


export default function SongListNameModal({ onSave, onClose }) {
    const [name, setName] = useState('');
    const { theme } = useTheme();
    const handleSave = () => {
        if (name.trim()) {
            onSave(name);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-xl mb-2">リストの名前を入力してください</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 w-full mb-4"
                />
                <button onClick={handleSave} className={`bg-customTheme-${theme}-primary text-white px-4 py-2 rounded mr-2`}>
                    保存
                </button>
                <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
                    キャンセル
                </button>
            </div>
        </div>
    );
} 