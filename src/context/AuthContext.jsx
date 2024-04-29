import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig, db } from '../../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);  // ローディング状態の追加
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(userRef, (doc) => {
          const userData = doc.data();
          setCurrentUser({ ...user, ...userData });
          setLoading(false);  // データが読み込まれたらローディングを終了
        });
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
    <AuthContext.Provider value={{ currentUser, loading }}>
      {loading ? <div>ローディング中...</div> : children}
    </AuthContext.Provider>
  );
};


