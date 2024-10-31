import Header from '@/components/header';
import { Sidebar } from '@/components/Sidebar';
import Footer from '@/components/footer';
import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const isListenerPage = router.pathname.startsWith('/public');

    return (
        <div>
            <Header toggleSidebar={toggleSidebar} />
            <div className="bg-[#efeeea] pt-[80px] min-h-screen">
                <main className="p-4 w-full flex">
                    {!isListenerPage && !isMobile && <Sidebar className="hidden md:block"/>}
                    <div className={`flex-1 ${!isListenerPage && !isMobile ? 'w-[calc(100%-256px)]' : 'w-full'}`}>
                        {children}
                    </div>
                    {!isListenerPage && isMobile && isMobileSidebarOpen && (
                        <div className="fixed inset-0 z-50 flex">
                            <div className="absolute inset-0 bg-black opacity-50" onClick={toggleSidebar}></div>
                            <div className="relative bg-white ml-auto">
                                <button className="absolute top-4 right-3 text-gray-700" onClick={toggleSidebar}>
                                    <FaTimes size={24} />
                                </button>
                                <Sidebar onLinkClick={toggleSidebar} />
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}
