import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore"; // Firestoreを使用するためのインポート

const SigninAndSignupForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const auth = getAuth();
    const db = getFirestore(); // Firestoreのインスタンスを取得

    const handleAuth = async () => {
        try {
            if (isSignup) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log('登録成功:');
                // Firestoreにユーザードキュメントを追加
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    createdAt: new Date()
                });
                console.log('Firestoreにユーザードキュメントを追加しました。');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                console.log('ログイン成功:');
            }
            window.location.href = '/';
        } catch (error) {
            console.error(isSignup ? '登録失敗:' : 'ログイン失敗:', error);
            alert(isSignup ? '登録に失敗しました。' : 'ログインに失敗しました。');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
            <h1 className="text-2xl font-bold">{isSignup ? '新規登録' : 'ログイン'}</h1>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="メールアドレス"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワード"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    onClick={handleAuth}
                    className="w-full p-3 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                    {isSignup ? '登録' : 'ログイン'}
                </button>
                <button 
                    onClick={() => setIsSignup(!isSignup)}
                    className="w-full p-3 text-blue-500 border border-blue-500 rounded hover:bg-blue-100"
                >
                    {isSignup ? 'ログインに切り替え' : '登録に切り替え'}
                </button>
            </div>
        </div>
    );
};

export default SigninAndSignupForm;

