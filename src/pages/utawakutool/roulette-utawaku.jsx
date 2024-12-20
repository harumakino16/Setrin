// utawakutool/roulette-utawaku.jsx
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/pages/layout';
import { db } from '@/../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useSongs } from '@/context/SongsContext';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { FaClipboard, FaYoutube, FaExternalLinkAlt } from 'react-icons/fa';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import H1 from '@/components/ui/h1';
import BackButton from '@/components/BackButton';
import RouletteContent from '@/components/roulette/RouletteContent';

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


  const isReady = currentUser && songs;

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

  const copyToClipboard = () => {
    if (selectedSong) {
      navigator.clipboard.writeText(selectedSong.title);
      setCopyMessage('コピーしました！');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const handleSetlistChange = (e) => {
    setSelectedSetlistId(e.target.value);
    setSelectedSong(null);
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

  return (
    <Layout>
      <div className="p-8 space-y-8 max-w-4xl mx-auto">
        {/* ヘッダーセクション */}
        <div className="space-y-2">
          {/* 戻るリンク */}
          <BackButton text="ツール一覧に戻る" href="/utawakutool" />
          <H1>ルーレット歌枠</H1>
          <p className="text-gray-600 text-sm">
            セットリストからランダムに曲を選びます。決定ボタンを押すとYouTubeリンクが設定されている場合は自動で開きます。
          </p>
        </div>


        {/* セットリスト選択UI */}
        {isReady && (
          <div className="bg-white p-6 rounded shadow-sm space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">セットリスト選択</h2>
              <p className="text-sm text-gray-600">どのセットリストから選びますか？</p>
            </div>
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
          </div>
        )}



        {/* ルーレットコンテンツ */}
        {isReady && setlist && currentSongs.length > 0 && (
          <RouletteContent currentSongs={currentSongs} />
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
      </div>
    </Layout>
  );
}

export const getServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};
