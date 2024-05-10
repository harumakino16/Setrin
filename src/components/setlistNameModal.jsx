import React, { useState, useContext } from 'react';
import Modal from "@/components/modal";
import { db } from '../../firebaseConfig';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';

const SetlistNameModal = ({ isOpen, onClose, onSetlistAdded }) => {
    const [inputValue, setInputValue] = useState('');
    const { currentUser } = useContext(AuthContext);
    const { setMessageInfo } = useMessage();

    const handleSubmit = async () => {
        if (currentUser) {
            const setlistRef = collection(db, 'users', currentUser.uid, 'Setlists');
            await addDoc(setlistRef, {
                name: inputValue,
                createdAt: serverTimestamp()
            });
            setMessageInfo({ message: '再生リストを作成しました', type: 'success' });
            onClose(); // モーダルを閉じる
        } else {
            alert("ユーザーが認証されていません。");
            setMessageInfo({ message: 'エラー：再生リストの作成中にエラーが発生しました', type: 'error' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="mb-4">
                <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="search">
                    フォルダを作成
                </label>
                <input
                    className="shadow appearance-none border rounded w-full h-12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="search"
                    type="text"
                    placeholder="名前"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>
            <div className="flex items-center justify-between">
                <button
                    className={`bg-blue-500 hover:bg-blue-7000 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${inputValue ? '' : 'opacity-50 cursor-not-allowed bg-gray-500 hover:bg-gray-400'}`}
                    type="submit"
                    disabled={!inputValue}
                    onClick={handleSubmit}
                >
                    作成
                </button>
            </div>
        </Modal>
    );
};

export default SetlistNameModal;

