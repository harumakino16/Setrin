import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export const fetchUserData = async (userId) => {
  try {
    const songsRef = collection(db, `users/${userId}/Songs`);
    const songsSnapshot = await getDocs(songsRef);

    const songs = [];
    const tags = {};
    const genres = {};
    songsSnapshot.forEach(doc => {
      const songData = doc.data();
      songs.push(songData);

      songData.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });

      const genre = songData.genre;
      if (genre) {
        genres[genre] = (genres[genre] || 0) + 1;
      }
    });

    return {
      totalSongs: songs.length,
      tags,
      genres,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      totalSongs: 0,
      tags: {},
      genres: {},
    };
  }
};