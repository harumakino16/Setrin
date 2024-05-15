import React, { useState } from 'react';
import Modal from './modal';

const EditSetlistNameModal = ({ setlist, isOpen, onClose, onSetlistUpdated, currentUser }) => {
    const [name, setName] = useState(setlist ? setlist.name : '');

    const handleSave = async () => {
        const updatedSetlist = { ...setlist, name };
        const setlistRef = doc(db, 'users', currentUser.uid, 'Setlists', setlist.id);
        await updateDoc(setlistRef, { name });
        onSetlistUpdated(updatedSetlist);
        onClose();
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
                    <button onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
                        キャンセル
                    </button>
                    <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        保存
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditSetlistNameModal;
