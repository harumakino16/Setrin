import React, { useState, useContext } from 'react';
import { FcGoogle } from "react-icons/fc";
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useMessage } from '../context/MessageContext';
import useGoogleSignUpLogin from '../hooks/googleSignUpLogin';

function Signup({ setShowSignup, setShowEmailVerification, setEmail, email }) {
    const { setCurrentUser } = useContext(AuthContext);
    const router = useRouter();
    const { setMessageInfo } = useMessage();
    const { handleGoogleSignUpLogin } = useGoogleSignUpLogin();
    const [loading, setLoading] = useState(false);


    return (
        <div className=" w-[600px] mx-auto p-16 pb-5 bg-white rounded-lg">
            <h1 className="text-xl font-bold mb-4 text-center">会員登録</h1>
            <div className="flex flex-col space-y-4">
                <button onClick={handleGoogleSignUpLogin} className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-4 px-4 border border-gray-200 rounded w-full">
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
