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
            setIsMobile(window.innerWidth <= 1016);
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
            <div className="bg-[#efeeea] min-h-screen">
                <main className="flex">
                    {!isListenerPage && !isMobile && <Sidebar className="hidden md:block"/>}
                    <div className={`flex-1 ${!isListenerPage && !isMobile ? 'w-[calc(100%-256px)] p-4' : 'w-full p-4'}`}>
                        {children}
                    </div>
                    {!isListenerPage && isMobile && isMobileSidebarOpen && (
                        <div className="fixed inset-0 z-50 flex">
                            <div className="absolute inset-0 bg-black opacity-50" onClick={toggleSidebar}></div>
                            <div className="relative bg-white ml-auto">
                                <button 
                                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800" 
                                    onClick={toggleSidebar}
                                >
                                    <FaTimes size={20} />
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
