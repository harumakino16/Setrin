import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';




const useSetlists = () => {
  const [setlists, setSetlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser) {
      const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
      const q = query(setlistsRef);
      const unsubscribe = onSnapshot(q, snapshot => {
        if (snapshot.empty) {
          console.log('セットリストが見つかりません。');
        } else {
          const fetchedSetlists = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : '日付不明';
            return {
              id: doc.id,
              ...data,
              createdAt // FirestoreのTimestampをDateオブジェクトに変換し、存在しない場合は「日付不明」を使用
            };
          });
          setSetlists(fetchedSetlists);
        }
        setLoading(false);
      }, error => {
        console.error('セットリストの取得中にエラーが発生しました:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  return { setlists, loading };
};

export default useSetlists;
