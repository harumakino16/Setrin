import React, { useState, useContext } from 'react';
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import Link from 'next/link';
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useMessage } from '../context/MessageContext';
import { registerUserInFirestore } from '@/utils/firebaseUtils'; // ここでインポート

function Signup({ setShowSignup, setShowEmailVerification, setEmail, email }) {
    const { setCurrentUser } = useContext(AuthContext);
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { setMessageInfo } = useMessage();

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const isFormValid = () => {
        return validateEmail(email) && validatePassword(password);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const auth = getAuth();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            await registerUserInFirestore(userCredential.user);
            setShowSignup(false);
            setShowEmailVerification(true);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setMessageInfo({ message: '登録済みのメールアドレスです', type: 'error' });
            } else {
                console.error("メールでの登録エラー:", error);
            }
        }
    };

    const handleGoogleSignup = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await registerUserInFirestore(result.user);
        } catch (error) {
            console.error("Googleサインインエラー:", error);
            setMessageInfo({ message: 'Google登録に失敗しました', type: 'error' });
        }
    };

    return (
        <div className=" w-[600px] mx-auto p-16 pb-5 bg-white rounded-lg">
            <h1 className="text-xl font-bold mb-4 text-center">会員登録</h1>
            <form onSubmit={handleSubmit} className="space-y-4 ">
                <div>
                    <label htmlFor="email" className="block text-lg font-medium text-gray-700">メールアドレス</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="taro.yamada@example.com"
                        className="mt-1 block w-full px-3 h-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-lg font-medium text-gray-700">パスワード</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="パスワード"
                        className="mt-1 block w-full px-3 h-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <button type="submit" disabled={!isFormValid()} className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isFormValid() ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 gap-3`}>
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
            <p className="mt-6 text-sm text-gray-600 text-center mb-5"><a href="/termsuser" className="text-blue-500">利用規約</a>、<a href="/privacypolicy" className="text-blue-500">プライバシーポリシー</a>に同意の上、ご登録ください</p>
            <div className='text-center'>
                すでにアカウントをお持ちですか？<Link href="/login" className="text-blue-500"> ログイン</Link>
            </div>
        </div>
    );
}

export default Signup;
