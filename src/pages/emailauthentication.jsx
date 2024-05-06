import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from "@/context/AuthContext";
import { useMessage } from "@/context/MessageContext";
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const EmailAuthentication = () => {
  const router = useRouter();
  const { setMessageInfo } = useMessage();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (router.query.oobCode && currentUser) {
      // Firestoreにユーザー情報を登録
      const userRef = doc(db, 'users', currentUser.uid);
      setDoc(userRef, { emailVerified: true }, { merge: true })
        .then(() => {
          setMessageInfo({ message: 'メール認証が完了しました。アカウントが有効になりました。', type: 'success' });
          router.push('/'); // ホームページまたはダッシュボードにリダイレクト
        })
        .catch(error => {
          setMessageInfo({ message: `データベースエラー: ${error.message}`, type: 'error' });
          router.push('/login'); // エラーが発生した場合はログインページにリダイレクト
        });
    } else {
      setMessageInfo({ message: '認証エラー。無効なリンクか、すでに認証が完了しています。', type: 'error' });
      router.push('/login'); // ログインページにリダイレクト
    }
  }, [router.query.oobCode, currentUser]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">メール認証を確認中...</h1>
        <p>少々お待ちください。</p>
      </div>
    </div>
  );
};

export default EmailAuthentication;
