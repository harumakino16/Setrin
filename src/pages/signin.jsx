import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { firebaseConfig } from "../../firebaseConfig";
import { initializeApp } from "firebase/app";

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = getAuth();

  const handleSignin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('ログイン成功:');
      window.location.href = '/';
    } catch (error) {
      console.error('ログイン失敗:', error);
      alert('ログインに失敗しました。');
    }
  };

  return (
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
  );
}

export default Signin;
