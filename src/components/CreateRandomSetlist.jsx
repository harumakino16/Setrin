import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import SearchForm from '@/components/SearchForm';
import Modal from '@/components/Modal';
import useSearchCriteria from '@/hooks/useSearchCriteria';
import fetchUsersSetlists from '../hooks/fetchSetlists';
import { useSongs } from '@/context/SongsContext';
import { useTheme } from '@/context/ThemeContext';
import { useSetlistCreation } from '@/hooks/useSetlistCreation';

export default function CreateRandomSetlist({ isOpen, onClose }) {
    const { currentUser } = useContext(AuthContext);
    const { setMessageInfo } = useMessage();
    const [searchResults, setSearchResults] = useState([]);
    const [numberOfSongs, setNumberOfSongs] = useState(10);
    const router = useRouter();
    const { searchCriteria, setSearchCriteria } = useSearchCriteria({});
    const { setlists: existingSetlists } = fetchUsersSetlists(currentUser);
    const [activeTab, setActiveTab] = useState('random');
    const { songs } = useSongs();
    const { theme } = useTheme();
    const { createSetlist } = useSetlistCreation();

    useEffect(() => {
        setSearchResults(songs);
    }, [songs]);

    useEffect(() => {
        if (searchResults.length > 0 && searchResults.length < 10) {
            setNumberOfSongs(searchResults.length);
        }
    }, [searchResults]);

    const handleSearchResults = (results) => {
        setSearchResults(results);
        if (results.length < numberOfSongs) {
            setNumberOfSongs(results.length);
        }
    };

    const createRandomSetlist = async () => {
        if (searchResults.length === 0) {
            setMessageInfo({ type: 'error', message: '検索結果がありません。' });
            return;
        }

        const randomSongs = searchResults.sort(() => 0.5 - Math.random()).slice(0, numberOfSongs);
        const setlistName = `ランダムセットリスト - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

        try {
            const newSetlistId = await createSetlist({
                name: setlistName,
                songIds: randomSongs.map(song => song.id),
                existingSetlists
            });

            if (newSetlistId) {
                // ランダムセットリスト作成のカウントを更新
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    'userActivity.randomSetlistCount': increment(1),
                    'userActivity.monthlyRandomSetlistCount': increment(1),
                    'userActivity.lastActivityAt': serverTimestamp(),
                });

                handleClose();
                router.push(`/setlist/${newSetlistId}`);
            }
        } catch (error) {
            console.error('Error creating random setlist:', error);
        }
    };

    const handleClose = () => {
        setActiveTab('random');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="flex flex-col gap-2 min-w-[300px] md:min-w-[600px] md:max-w-[75vw]">
                <h2 className={`text-2xl font-bold text-customTheme-${theme}-primary text-center`}>セトリを作る</h2>
                <div className="flex justify-center gap-4 mt-4 border-b">
                    <button
                        onClick={() => setActiveTab('random')}
                        className={`py-2 px-4 text-xs md:text-base ${activeTab === 'random' ? `border-b-2 border-customTheme-${theme}-primary text-customTheme-${theme}-primary` : 'text-gray-500'}`}
                    >
                        完全ランダムで作成
                    </button>
                    <button
                        onClick={() => setActiveTab('criteria')}
                        className={`py-2 px-4 text-xs md:text-base ${activeTab === 'criteria' ? `border-b-2 border-customTheme-${theme}-primary text-customTheme-${theme}-primary` : 'text-gray-500'}`}
                    >
                        条件を指定する
                    </button>
                </div>
                {activeTab === 'random' && (
                    <div className="mt-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-gray-600">出力する曲数を選択してください:</label>
                            <input
                                type="number"
                                value={numberOfSongs}
                                onChange={(e) => setNumberOfSongs(parseInt(e.target.value, 10))}
                                className="border p-2 rounded w-full"
                                min="1"
                            />
                        </div>
                        <button onClick={createRandomSetlist} className={`mt-4 text-lg bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-5 px-4 rounded w-full`}>
                            ランダムセットリストを作成
                        </button>
                    </div>
                )}
                {activeTab === 'criteria' && (
                    <>
                        <SearchForm
                            currentUser={currentUser}
                            handleSearchResults={handleSearchResults}
                            searchCriteria={searchCriteria}
                            setSearchCriteria={setSearchCriteria}
                            isRandomSetlist={true}
                        />
                        <div className="text-sm text-gray-600 mt-2">
                            {`検索結果: ${searchResults.length} 件`}
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-sm text-gray-600">出力する曲数を選択してください:</label>
                            <input
                                type="number"
                                value={numberOfSongs}
                                onChange={(e) => setNumberOfSongs(parseInt(e.target.value, 10))}
                                className="border p-2 rounded w-full"
                                min="1"
                                max={searchResults.length}
                            />
                        </div>
                        <button onClick={createRandomSetlist} className={`mt-4 text-lg bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-5 px-4 rounded w-full`}>
                            ランダムセットリストを作成
                        </button>
                    </>
                )}
            </div>
        </Modal>
    );
}
