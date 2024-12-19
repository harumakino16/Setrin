import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseConfig } from "../../firebaseConfig";
import { initializeApp } from "firebase/app";
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();

  const handleSignin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      window.location.href = '/';
    } catch (error) {
      
      alert('ログインに失敗しました。');
    }
  };

  return (
    <NoSidebarLayout>
      <div>
        <div className="flex flex-col items-center justify-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
        />
        <button onClick={handleSignin}>ログイン</button>
        </div>
      </div>
    </NoSidebarLayout>
  );
}

export default Signin;

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}