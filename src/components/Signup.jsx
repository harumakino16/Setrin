import React, { useState, useContext } from 'react';
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import Link from 'next/link';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { AuthContext } from '@/context/AuthContext';
import  MessageBox from '@/components/MessageBox'
import { useRouter } from 'next/router';

function Signup() {
    const [email, setEmail] = useState('');
    const { setCurrentUser } = useContext(AuthContext);
    const [message, setMessage] = useState(''); // MessageBox用のメッセージ状態
    const [messageType, setMessageType] = useState(''); // MessageBox の種類

    const router = useRouter();

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Email submitted:', email);
    };

    const handleGoogleSignup = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = result.credential;
            const token = result.user.accessToken; 
            const user = result.user;
            console.log(token, user);

            // Firestoreにユーザードキュメントを作成
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date()
            }, { merge: true });

            setCurrentUser(user); // Contextにユーザー情報を設定
            setMessageType('success');
            setMessage('Google登録に成功しました');
            router.push('/');
        } catch (error) {
            console.error("Googleサインインエラー:", error);
            setMessageType('error');
            setMessage('Google登録に失敗しました');
        }
    };

    return (
        <div className=" w-[600px] mx-auto p-16 bg-white shadow-lg rounded-lg">
            <h1 className="text-xl font-bold mb-4 text-center">会員登録</h1>
            <form onSubmit={handleSubmit} className="space-y-4 ">
                <div>
                    <label htmlFor="email" className="block text-lg font-medium text-gray-700">メールアドレス</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="taro.yamada@example.com"
                        className="mt-1 block w-full px-3 h-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <button type="submit" className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 gap-3">
                    <MdEmail size={24} />
                    <span>メールアドレスで登録する</span>
                </button>
            </form>
            <div className="flex items-center justify-center my-6">
                <hr className="flex-grow" />
                <div className="text-center text-gray-500 mx-4 text-sm">または</div>
                <hr className="flex-grow" />
            </div>
            <div className="flex flex-col space-y-4">
                <button onClick={handleGoogleSignup} className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-4 px-4 border border-gray-200 rounded w-full">
                    <div className="flex items-center justify-start space-x-2">
                        <FcGoogle size={24} />
                        <span className="flex-grow text-center">Googleで登録する</span>
                    </div>
                </button>

            </div>
            <p className="mt-6 text-sm text-gray-600">利用規約、プライバシーポリシーに同意の上、ご登録ください</p>
            <div className='text-center'>
                すでにアカウントをお持ちですか？<Link href="/login" className="text-blue-500"> ログイン</Link>
            </div>
            <MessageBox type={messageType} message={message} />
        </div>
    );
}

export default Signup;