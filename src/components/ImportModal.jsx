import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faFileDownload } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import { db } from '../../firebaseConfig';
import { collection, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';

const ImportModal = ({ onClose, onSongsUpdated }) => {
    const [file, setFile] = useState(null);
    const [importMode, setImportMode] = useState('replace');
    const { currentUser } = useContext(AuthContext);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
            document.getElementById('drop-zone-text').textContent = 'ファイルが選択されました: ' + selectedFile.name;
        } else {
            alert('CSVファイルのみが許可されています。');
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.items[0].getAsFile();
        if (droppedFile && droppedFile.type === "text/csv") {
            setFile(droppedFile);
            document.getElementById('drop-zone-text').textContent = 'ファイルがドロップされました: ' + droppedFile.name;
        } else {
            alert('CSVファイルのみが許可されています。');
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const csvSchema = {
        headers: ['曲名', 'アーティスト', 'カラオケ音源のYoutubeURL', 'タグ', 'ジャンル', '収益化', '歌った回数','熟練度'],
        templateData: '曲名,アーティスト,カラオケ音源のYoutubeURL,タグ,ジャンル,収益化,歌った回数\nサンプルです。,この行は削除してください。,https://www.youtube.com/sample/watch?v=sample,"盛り上がる曲,眠れる曲","ボカロ,アニソン",はい,15,10\n'
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
                artist: song['アーティスト'],
                youtubeUrl: song['カラオケ音源のYoutubeURL'],
                tags: song['タグ'].split(',').map(tag => tag.trim()),
                genres: song['ジャンル'].split(',').map(genre => genre.trim()),
                monetized: song['収益化'] === 'はい', // monetizedをbool型で保存
                timesSung: parseInt(song['歌った回数']), // timesSungをint型で保存
                skillLevel: parseInt(song['熟練度']) // skillLevelをint型で保存
            };
            batch.set(docRef, songData);
        });

        await batch.commit();
        alert('インポートが完了しました。');
        onClose(); // モーダルを閉じる
        onSongsUpdated(); // 曲データを再読み込み
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
                console.error("Error parsing CSV:", err);
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

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-fit shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center px-4 py-2">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">CSVファイルをインポート</h3>
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
                        <p id="drop-zone-text">ファイルをここにドラッグ&ドロップ、または</p>
                        <input type="file" onChange={handleFileChange} accept=".csv" className="mt-2" />
                    </div>
                </div>
                <div className="items-center px-4 py-3">
                    <div className="flex justify-between mb-4">
                        <label>
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
                <div className="items-center px-4 py-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
