import { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig, db } from '../../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import Loading from '@/components/loading';
import { adminUUIDs } from '@/config/admin'; // 追加

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // 管理者フラグの追加
  const auth = getAuth(initializeApp(firebaseConfig));

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(userRef, (doc) => {
          const userData = doc.data();
          setCurrentUser({ ...user, ...userData });

          // 管理者かどうかを判定
          if (adminUUIDs.includes(user.uid)) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }

          setLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setCurrentUser(null);
        setIsAdmin(false); // ユーザーがいない場合は管理者フラグをfalseに
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, setCurrentUser, isAdmin }}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);