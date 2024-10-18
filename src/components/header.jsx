import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa'; // ReactIconをインポート

const Header = ({ toggleSidebar }) => {
    return (
        <header className="bg-blue-500 text-white fixed w-full z-50">
            <div className="container mx-auto flex justify-between items-center h-[60px]">
                <Link href="/">
                    <Image
                        src="/images/SetLink_white_trance (1000 x 300 px).png"
                        alt="SetLink Logo"
                        width={150}
                        height={50}
                        className="h-auto w-auto"
                    />
                </Link>
                <button className="md:hidden" onClick={toggleSidebar}>
                    <FaBars size={24} />
                </button>
            </div>
        </header>
    );
};

export default Header;
