import Header from '@/components/header';
import { Sidebar } from '@/components/Sidebar';
import Footer from '@/components/footer';
import HeaderPadding from '@/components/headerPadding';
import { useState, useEffect } from 'react';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初期チェック

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div>
            <Header />
            {/* <HeaderPadding /> */}
            <div className="bg-[#efeeea] pt-[80px]">
                <main className="p-4 w-full flex">
                    {!isMobile && <Sidebar className="hidden md:block" />}
                    <div className={`flex-1 ${!isMobile ? 'w-[calc(100%-256px)]' : 'w-full'}`}>
                        {children}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}
