// utawakutool/roulette-utawaku.jsx
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/pages/layout';
import { db } from '@/../firebaseConfig';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useSongs } from '@/context/SongsContext';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { FaClipboard, FaYoutube, FaExternalLinkAlt, FaQuestionCircle } from 'react-icons/fa';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import H1 from '@/components/ui/h1';
import BackButton from '@/components/BackButton';
import RouletteContent from '@/components/roulette/RouletteContent';
import CreateRandomSetlist from '@/components/CreateRandomSetlist';
import { useSetlistCreation } from '@/hooks/useSetlistCreation';
import RouletteHistory from '@/components/roulette/RouletteHistory';
import HowToUseModal from '@/components/roulette/HowToUseModal';
import PremiumCheck from '@/components/PremiumCheck';

export default function RouletteUtawaku() {
  const { theme } = useTheme();
  const { currentUser } = useContext(AuthContext);
  const { songs } = useSongs();
  const router = useRouter();
  const { setlistId } = router.query;

  const [setlists, setSetlists] = useState([]);
  const [selectedSetlistId, setSelectedSetlistId] = useState(setlistId || '');
  const [setlist, setSetlist] = useState(null);
  const [currentSongs, setCurrentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [copyMessage, setCopyMessage] = useState('');
  const [animationClass, setAnimationClass] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isAddSetlistOpen, setIsAddSetlistOpen] = useState(false);
  const [showHowToUse, setShowHowToUse] = useState(false);

  const isReady = currentUser && songs;

  const { createSetlist } = useSetlistCreation();

  // ユーザーのセットリスト一覧を取得
  useEffect(() => {
    if (!currentUser) return;
    const fetchSetlists = async () => {
      const colRef = collection(db, `users/${currentUser.uid}/Setlists`);
      const snap = await getDocs(colRef);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSetlists(list);
    };
    fetchSetlists();
  }, [currentUser]);

  // セットリストをフェッチ
  useEffect(() => {
    if (!isReady) return; // currentUserとsongs待ち
    if (!selectedSetlistId) {
      setLoading(false);
      return;
    }

    const fetchSetlist = async () => {
      setLoading(true);
      const setlistRef = doc(db, `users/${currentUser.uid}/Setlists/${selectedSetlistId}`);
      const snapshot = await getDoc(setlistRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSetlist({ id: snapshot.id, ...data });
      } else {
        setSetlist(null);
      }
      setLoading(false);
    };
    fetchSetlist();
  }, [currentUser, selectedSetlistId, isReady]);

  // 現在のセットリスト曲リストを抽出
  useEffect(() => {
    if (setlist && songs) {
      const songIdIndexMap = new Map(setlist.songIds?.map((id, index) => [id, index]) || []);
      const filteredSongs = songs
        .filter(song => setlist.songIds?.includes(song.id))
        .sort((a, b) => (songIdIndexMap.get(a.id) - songIdIndexMap.get(b.id)));
      setCurrentSongs(filteredSongs);
    } else {
      setCurrentSongs([]);
    }
  }, [setlist, songs]);

  const handleSetlistChange = (e) => {
    setSelectedSetlistId(e.target.value);
    setSelectedSong(null);
    if (!e.target.value) {
      setSetlist(null);
    }
  };

  const openPopupWindow = () => {
    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      `/utawakutool/roulette-popup?setlistId=${selectedSetlistId}`,
      'RoulettePopup',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const createFullSetlist = async () => {
    if (!currentUser || !songs) return;
    
    try {
      const newSetlistId = await createSetlist({
        name: '全曲セットリスト',
        songIds: songs.map(song => song.id),
        existingSetlists: setlists
      });

      if (newSetlistId) {
        setSelectedSetlistId(newSetlistId);
        // 新しいセットリストを追加
        setSetlists(prev => [...prev, {
          id: newSetlistId,
          name: '全曲セットリスト',
          songIds: songs.map(song => song.id),
          createdAt: new Date()
        }]);
        
        setSuccessMessage('セットリストを作成しました！');
        setTimeout(() => setSuccessMessage(''), 3000);
        setIsAddSetlistOpen(false);
      }
    } catch (error) {
      console.error('セットリスト作成エラー:', error);
    }
  };

  async function handleRouletteStart() {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;
    const data = userSnap.data().userActivity || {};
    const lastTime = data.lastRouletteSessionTime
        ? data.lastRouletteSessionTime.toDate()
        : null;

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    if (!lastTime || lastTime < threeHoursAgo) {
        await updateDoc(userRef, {
            'userActivity.rouletteCount': increment(1),
            'userActivity.monthlyRouletteCount': increment(1),
            'userActivity.lastRouletteSessionTime': serverTimestamp(),
            'userActivity.lastActivityAt': serverTimestamp(),
        });
    } else {
        // 3時間未満ならカウントせず lastActivityAt のみ更新
        await updateDoc(userRef, {
            'userActivity.lastActivityAt': serverTimestamp(),
        });
    }
  }


  return (
    <PremiumCheck>
      <Layout>
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
          {/* ヘッダーセクション */}
          <div className="space-y-2">
            {/* 戻るリンク */}
            <BackButton text="ツール一覧に戻る" href="/utawakutool" />
            <div className="flex justify-between items-center">
              <H1>ルーレット歌枠</H1>
              <button
                onClick={() => setShowHowToUse(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <FaQuestionCircle />
                <span className="text-sm">使い方を見る</span>
              </button>
            </div>
          </div>

          {/* 使い方モーダル */}
          <HowToUseModal
            isOpen={showHowToUse}
            onClose={() => setShowHowToUse(false)}
          />

          {/* セットリスト選択UI */}
          {isReady && (
            <div className="bg-white p-6 rounded shadow-sm space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">セットリスト選択</h2>
                <p className="text-sm text-gray-600">どのセットリストから選びますか？</p>
              </div>
              {setlists.length > 0 && (
                <>
                  <select
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    value={selectedSetlistId}
                    onChange={handleSetlistChange}
                  >
                    <option value="">選択してください</option>
                    {setlists.map(sl => (
                      <option key={sl.id} value={sl.id}>{sl.name}</option>
                    ))}
                  </select>

                  <div className="border-t pt-4 mt-4">
                    <button
                      onClick={() => setIsAddSetlistOpen(!isAddSetlistOpen)}
                      className="text-customTheme-${theme}-primary hover:text-customTheme-${theme}-accent text-sm flex items-center gap-1 w-full"
                    >
                      <span className="text-xs transform transition-transform duration-200" style={{ 
                        display: 'inline-block',
                        transform: isAddSetlistOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                      }}>
                        ▶
                      </span>
                      セットリストを追加する
                    </button>

                    {isAddSetlistOpen && (
                      <div className="mt-4 space-y-3 pl-4">
                        <button 
                          onClick={() => setShowCreateModal(true)}
                          className={`block w-full bg-customTheme-${theme}-primary text-white px-4 py-2 rounded hover:bg-customTheme-${theme}-accent transition-colors`}
                        >
                          条件を絞ったリストを作成する
                        </button>
                        <button 
                          onClick={createFullSetlist}
                          className={`block w-full bg-white border-2 border-customTheme-${theme}-primary text-customTheme-${theme}-primary px-4 py-2 rounded hover:bg-gray-50 transition-colors`}
                        >
                          持ち歌全曲を含めたリストを作成する
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {setlists.length === 0 && (
                <div className="text-center space-y-4">
                  <p className="text-gray-600">セットリストがまだ作成されていません。</p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className={`block w-full bg-customTheme-${theme}-primary text-white px-4 py-2 rounded hover:bg-customTheme-${theme}-accent transition-colors`}
                    >
                      条件を絞ったリストを作成する
                    </button>
                    <button 
                      onClick={createFullSetlist}
                      className={`block w-full bg-white border-2 border-customTheme-${theme}-primary text-customTheme-${theme}-primary px-4 py-2 rounded hover:bg-gray-50 transition-colors`}
                    >
                      持ち歌全曲を含めたリストを作成する
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      ※ セットリストを作成すると、ルーレットで使用できるようになります
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ルーレットコンテンツ */}
          {isReady && setlist && currentSongs.length > 0 && (
            <RouletteContent
              currentSongs={currentSongs}
              setlist={setlist}
            />
          )}
          {/* ポップアップボタン */}
          {isReady && setlist && currentSongs.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={openPopupWindow}
                className="text-customTheme-${theme}-primary hover:text-customTheme-${theme}-accent text-sm inline-flex items-center gap-1"
              >
                <span>ルーレットを別ウィンドウで開く</span>
                <FaExternalLinkAlt className="text-xs" />
              </button>
            </div>
          )}
          {/* ルーレット履歴 */}
          <div className="mt-4 bg-white p-6 rounded shadow-sm space-y-4">
            <RouletteHistory setlist={setlist} />
          </div>

          {showCreateModal && (
            <CreateRandomSetlist
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onComplete={(newSetlistId) => {
                setShowCreateModal(false);
                setSelectedSetlistId(newSetlistId);
                setSuccessMessage('セットリストを作成しました！');
                setTimeout(() => setSuccessMessage(''), 3000);
                setIsAddSetlistOpen(false);
              }}
            />
          )}
        </div>
      </Layout>
    </PremiumCheck>
  );
}

export const getServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};
