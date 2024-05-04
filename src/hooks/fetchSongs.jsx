import { useState, useEffect, useContext } from 'react';
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const useFetchSongs = (refreshTrigger,currentUser) => {
  const [songs, setSongs] = useState([]);

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
