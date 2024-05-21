import React from 'react';
import Link from 'next/link';

const Header = () => {
    return (
        <header className="bg-blue-500 text-white fixed w-full">
            <div className="container mx-auto flex justify-between items-center h-[60px]">
                <Link href="/" className="text-lg font-bold">Setlink</Link>
                <nav>
                    <ul className="flex space-x-4">
                        <li>
                            <Link href="/" className="hover:underline">ホーム</Link>
                        </li>
                        <li>
                            <Link href="/about" className="hover:underline">アバウト</Link>
                        </li>
                        <li>
                            <Link href="/contact" className="hover:underline">コンタクト</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
