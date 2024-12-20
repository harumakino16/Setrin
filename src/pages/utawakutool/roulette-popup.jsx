import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { db } from '@/../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useSongs } from '@/context/SongsContext';
import { useTheme } from '@/context/ThemeContext';
import RouletteContent from '@/components/roulette/RouletteContent';

export default function RoulettePopup() {
  const { theme } = useTheme();
  const { currentUser } = useContext(AuthContext);
  const { songs } = useSongs();
  const router = useRouter();
  const { setlistId } = router.query;

  const [setlist, setSetlist] = useState(null);
  const [currentSongs, setCurrentSongs] = useState([]);

  const isReady = currentUser && songs;

  // セットリストをフェッチ
  useEffect(() => {
    if (!isReady || !setlistId) return;

    const fetchSetlist = async () => {
      const setlistRef = doc(db, `users/${currentUser.uid}/Setlists/${setlistId}`);
      const snapshot = await getDoc(setlistRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSetlist({ id: snapshot.id, ...data });
      }
    };
    fetchSetlist();
  }, [currentUser, setlistId, isReady]);

  // 現在のセットリスト曲リストを抽出
  useEffect(() => {
    if (setlist && songs) {
      const songIdIndexMap = new Map(setlist.songIds?.map((id, index) => [id, index]) || []);
      const filteredSongs = songs
        .filter(song => setlist.songIds?.includes(song.id))
        .sort((a, b) => (songIdIndexMap.get(a.id) - songIdIndexMap.get(b.id)));
      setCurrentSongs(filteredSongs);
    }
  }, [setlist, songs]);

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      {isReady && setlist && currentSongs.length > 0 && (
        <RouletteContent currentSongs={currentSongs} />
      )}
    </div>
  );
} 