import React, { useState, useContext, useEffect } from 'react';
import Modal from "@/components/Modal";
import { db } from '../../firebaseConfig';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { useTheme } from '@/context/ThemeContext';
import fetchUsersSetlists from '@/hooks/fetchSetlists';
import { FREE_PLAN_MAX_SETLISTS } from '@/constants';

const SetlistNameModal = ({ isOpen, onClose, onSetlistAdded }) => {
    const [inputValue, setInputValue] = useState('');
    const { currentUser } = useContext(AuthContext);
    const { setMessageInfo } = useMessage();
    const { theme } = useTheme();
    const { setlists } = fetchUsersSetlists(currentUser);

    // デフォルトのセットリスト名を設定
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
        setInputValue(`${formattedDate}　-　新しいセットリスト`);
    }, []);

    const handleSubmit = async () => {
        if (currentUser) {
            // 無料プランかどうか、セットリストの数をチェック
            if (currentUser.plan === 'free' && setlists.length >= FREE_PLAN_MAX_SETLISTS) {
                setMessageInfo({ type: 'error', message: `無料プランでは最大${FREE_PLAN_MAX_SETLISTS}個のセットリストまで保存できます。` });
                return;
            }

            const setlistRef = collection(db, 'users', currentUser.uid, 'Setlists');
            await addDoc(setlistRef, {
                name: inputValue,
                createdAt: serverTimestamp()
            });
            setMessageInfo({ message: 'セットリストを作成しました', type: 'success' });
            onClose(); // モーダルを閉じる
        } else {
            alert("ユーザーが認証されていません。");
            setMessageInfo({ message: 'エラー：セットリストの作成中にエラーが発生しました', type: 'error' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="mb-4 min-w-[300px] md:min-w-[400px]">
                <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="search">
                    セットリストを作成
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
            <div className="flex items-center justify-end">
                <button
                    className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${inputValue ? '' : 'opacity-50 cursor-not-allowed bg-gray-500 hover:bg-gray-400'}`}
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
