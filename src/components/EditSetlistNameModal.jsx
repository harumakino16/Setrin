import React, { useState } from 'react';
import Modal from './modal';

const EditSetlistNameModal = ({ setlist, isOpen, onClose, onSetlistUpdated, onSetlistDeleted }) => {
    const [name, setName] = useState(setlist ? setlist.name : '');

    const handleSave = async () => {
        // ここでセットリスト名の更新処理を実装します
        const updatedSetlist = { ...setlist, name };
        await onSetlistUpdated(updatedSetlist);
        // 例: APIを呼び出してデータベースを更新
        // 更新が成功したら以下を実行
        onSetlistUpdated(); // 親コンポーネントに更新を通知
        onClose(); // モーダルを閉じる
    };

    const handleDelete = async () => {
        // ここでセットリストの削除処理を実装します
        // 例: APIを呼び出してデータベースから削除
        // 削除が成功したら以下を実行
        onSetlistDeleted(); // 親コンポーネントに削除を通知
        onClose(); // モーダルを閉じる
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h2 className="text-lg font-bold mb-4">セットリスト名を編集</h2>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <div className="flex justify-end mt-4">
                    <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                        保存
                    </button>
                    <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        削除
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditSetlistNameModal;
