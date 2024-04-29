import { useState, useEffect, useContext } from 'react';
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from '../context/AuthContext';

const useFetchSongs = (refreshTrigger) => {
  const [songs, setSongs] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchSongs = async () => {
      if (currentUser) {
        const songsRef = collection(db, 'users', currentUser.uid, 'Songs');
        const q = query(songsRef);
        const querySnapshot = await getDocs(q);
        const songsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setSongs(songsData);
      } else {
        setSongs([]);
      }
    };

    fetchSongs();
  }, [refreshTrigger, currentUser]);

  return songs;
};

export default useFetchSongs;
