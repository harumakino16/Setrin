import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import { db } from '../../firebaseConfig';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';

const ImportModal = ({ onClose }) => {
    const [file, setFile] = useState(null);
    const [importMode, setImportMode] = useState('replace');
    const { currentUser } = useContext(AuthContext);
    const [fileName, setFileName] = useState('');

    const { setMessageInfo } = useMessage();


    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            document.getElementById('drop-zone-text').textContent = 'ファイルが選択されました: ' + selectedFile.name;
            event.target.style.display = 'none'; // ファイル選択ボタンを非表示にする
        } else {
            setMessageInfo({ message: 'CSVファイルのみが許可されています。', type: 'error' });
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === "text/csv") {
            setFile(droppedFile);
            setFileName(droppedFile.name);
            document.getElementById('drop-zone-text').textContent = 'ファイルがドロップされました: ' + droppedFile.name;
            document.querySelector('input[type="file"]').style.display = 'none'; // ファイル選択ボタンを非表示にする
        } else {
            setMessageInfo({ message: 'CSVファイルのみが許可されています。', type: 'error' });
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const csvSchema = {
        headers: ["曲名", "フリガナ", "アーティスト", "ジャンル", "タグ1", "タグ2", "タグ3", "カラオケ音源のYoutubeURL", "歌った回数", "熟練度", "備考"],
        templateData: '曲名,フリガナ,アーティスト,ジャンル,タグ1,タグ2,タグ3,カラオケ音源のYoutubeURL,歌った回数,熟練度,備考\nサンプルです。,サンプルデス,この行は削除してください。,ボカロ,楽しい,盛り上がる,夏曲,https://www.youtube.com/sample/watch?v=sample,15,5,ここは備考欄です。\n'
    };

    const updateDatabase = async (data, mode) => {
        const songsRef = collection(db, "users", currentUser.uid, "Songs");
        const batch = writeBatch(db);

        if (mode === 'replace') {
            const querySnapshot = await getDocs(songsRef);
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
        }

        data.forEach(song => {
            const docRef = doc(songsRef);
            const songData = {
                title: song['曲名'],
                furigana: song['フリガナ'] || '',
                artist: song['アーティスト'],
                genre: song['ジャンル'],
                tags: [song['タグ1'], song['タグ2'], song['タグ3']].filter(tag => tag.trim() !== ''), // 空のタグを除外
                youtubeUrl: song['カラオケ音源のYoutubeURL'],
                singingCount: song['歌った回数'] ? parseInt(song['歌った回数']) : 0, // singingCountをint型で保存
                skillLevel: song['熟練度'] ? parseInt(song['熟練度']) : 0, // skillLevelをint型で保存
                memo: song['備考'] // memoをstring型で保存
            };
            batch.set(docRef, songData);
        });

        await batch.commit();
        setMessageInfo('success', 'インポートが完了しました');
        onClose(); // モーダルを閉じる
    };

    const handleImport = () => {
        if (!file) return;

        Papa.parse(file, {
            complete: async (results) => {
                const data = results.data;
                const headers = results.meta.fields;

                if (!headers || !csvSchema.headers.every(header => headers.includes(header))) {
                    alert('CSVファイルの形式が正しくありません。必要なヘッダー: ' + csvSchema.headers.join(', '));
                    return;
                }

                await updateDatabase(data, importMode);
            },
            error: (err) => {
                
            },
            header: true,
            skipEmptyLines: true
        });
    };

    const handleDownloadTemplate = () => {
        const blob = new Blob([csvSchema.templateData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Modal コンポーネントを使用して UI をレンダリング
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-2">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 sm:mb-0">CSVファイルをインポート</h3>
                <button onClick={handleDownloadTemplate} className="flex items-center bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700">
                    <FontAwesomeIcon icon={faFileDownload} className="mr-2" />
                    テンプレートファイル
                </button>
            </div>
            <div className="mt-2 px-7 py-3">
                <div className="border-dashed border-2 border-gray-400 rounded-lg p-10 hover:bg-gray-100"
                    onDrop={handleDrop} onDragOver={handleDragOver}>
                    <div className='flex justify-center items-center mb-4'>
                        <FontAwesomeIcon icon={faFileCsv} size="3x" className="text-green-500" />
                    </div>
                    <p id="drop-zone-text" className="text-center">ファイルをここにドラッグ&ドロップ、または</p>
                    <input type="file" onChange={handleFileChange} accept=".csv" className="mt-2 w-full text-center" />
                </div>
            </div>
            <div className="items-center px-4 py-3">
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                    <label className="mb-2 sm:mb-0">
                        <input type="radio" name="importMode" value="replace" checked={importMode === 'replace'} onChange={() => setImportMode('replace')} />
                        曲リストを全て置き換える
                    </label>
                    <label>
                        <input type="radio" name="importMode" value="append" checked={importMode === 'append'} onChange={() => setImportMode('append')} />
                        既存の曲リストに追加する
                    </label>
                </div>
                <button onClick={handleImport} disabled={!file} className={`px-4 py-2 text-white text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-50 ${file ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-300'}`}>
                    インポート
                </button>
            </div>
        </div>
    );
};

export default ImportModal;
