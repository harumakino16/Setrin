import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const useSetlists = () => {
  const [setlists, setSetlists] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
      const q = query(setlistsRef, orderBy('createdAt', 'desc')); // 作成日時順に並び替え
      const unsubscribe = onSnapshot(q, snapshot => {
        if (snapshot.empty) {
          setSetlists([]);
        } else {
          const fetchedSetlists = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt ? `${data.createdAt.toDate().toLocaleDateString()} ${data.createdAt.toDate().toLocaleTimeString()}` : '日付不明';
            return {
              id: doc.id,
              ...data,
              createdAt // FirestoreのTimestampをDateオブジェクトに変換し、存在しない場合は「日付不明」を使用
            };
          });
          setSetlists(fetchedSetlists);


        }
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  return { setlists };
};

export default useSetlists;
