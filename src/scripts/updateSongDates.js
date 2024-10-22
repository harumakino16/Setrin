import { db } from '../../firebaseConfig';
import { collection, getDocs, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

const updateSongDates = async (userId) => {
  const songsRef = collection(db, 'users', userId, 'Songs');
  const snapshot = await getDocs(songsRef);

  const batch = writeBatch(db);

  snapshot.forEach((doc) => {
    const songRef = doc.ref;
    const songData = doc.data();

    if (!songData.createdAt) {
      batch.update(songRef, {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else if (!songData.updatedAt) {
      batch.update(songRef, {
        updatedAt: serverTimestamp()
      });
    }
  });

  await batch.commit();
  console.log('全ての曲のデータが更新されました。');
};

// 使用例
// updateSongDates('ユーザーID');

