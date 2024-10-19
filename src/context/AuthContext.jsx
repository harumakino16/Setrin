import { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig, db } from '../../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import Loading from '@/components/loading'; // Loading コンポーネントをインポート


export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);  // ローディング状態の追加
  const auth = getAuth(initializeApp(firebaseConfig));

  useEffect(() => {
    
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(userRef, (doc) => {
          const userData = doc.data();
          setCurrentUser({ ...user, ...userData });
          setLoading(false);  // データが読み込まれたらローディングを終了
        });
        return () => unsubscribeDoc();  // Firestore の監視を解除
      } else {
        setCurrentUser(null);
        setLoading(false);  // ユーザーがいない場合もローディングを終了
      }
    });

    return () => {
      unsubscribeAuth(); // Auth の監視を解除
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, setCurrentUser }}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};
