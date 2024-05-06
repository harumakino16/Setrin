import React from 'react';
import Image from 'next/image';
import mailIcon from '../images/mail-icon.png';

console.log(mailIcon);

const EmailVerificationComponent = ({email}) => {
    return (
        <div className="bg-white p-8 rounded-lg w-[400px] mx-auto mt-10">
            <div className="flex justify-center mb-6">
                <Image src={mailIcon} alt="Email Icon" width={80} height={80} />
            </div>
            <h2 className="text-center text-lg font-semibold mb-4">認証用メールをご確認ください</h2>
            <p className="text-sm text-center mb-6">下記メールアドレスに認証用メールを送信しました。<br/>メール内に記載されているURLをクリックしてアカウントの認証を完了してください。</p>
            <p className="text-center mb-4">{email}</p>

            <p className="text-center text-xs text-gray-500 mt-4">認証用メールが届かない場合は<a href="#" className="text-blue-500">こちら</a></p>
        </div>
    );
};

export default EmailVerificationComponent;
