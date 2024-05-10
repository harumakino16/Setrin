import { useEffect } from 'react';
import { useSongs } from '../context/SongsContext';
import { db } from "../../firebaseConfig";
import { collection, query, getDocs } from "firebase/firestore";

const useFetchSongs = (currentUser) => {
  const { setSongs } = useSongs();

  useEffect(() => {
    const fetchSongs = async () => {
      const localSongs = localStorage.getItem('songs');
      if (localSongs) {
        setSongs(JSON.parse(localSongs)); // ローカルストレージから読み込んだデータを設定
      } else {
        if (currentUser) {
          const songsRef = collection(db, 'users', currentUser.uid, 'Songs');
          const q = query(songsRef);
          const querySnapshot = await getDocs(q);
          const songsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSongs(songsData);
          localStorage.setItem('songs', JSON.stringify(songsData)); // 新しいデータをローカルストレージに保存
        }
      }
    };

    fetchSongs();
  }, [currentUser, setSongs]); // 依存配列に currentUser と setSongs を含める

  return;
};

export default useFetchSongs;
