import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
    return (
        <header className="bg-blue-500 text-white fixed w-full z-50">
            <div className="container mx-auto flex justify-between items-center h-[60px]">
                <Link href="/">
                    <Image
                        src="/images/SetLink_white_trance (1000 x 300 px).png" // 画像のパス
                        alt="SetLink Logo"
                        width={150} // 画像の幅
                        height={50} // 画像の高さ
                        className="h-auto w-auto" // 自動でサイズ調整
                    />
                </Link>
            </div>
        </header>
    );
};

export default Header;