import Link from 'next/link';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa'; // ReactIconをインポート
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/router';
import { db } from '@/../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Meta from './Meta';

const Header = ({ toggleSidebar }) => {
    const { theme } = useTheme();
    const router = useRouter();
    const [publicPageData, setPublicPageData] = useState([]);

    // Determine if the current page is a listener's page
    const isListenerPage = router.pathname.startsWith('/public');
    const headerClassName = isListenerPage ? `bg-customTheme-${publicPageData.color}-primary shadow-lg` : `bg-customTheme-${theme}-primary shadow-lg`;

    useEffect(() => {
        if (isListenerPage) {
            const getPublicPage = async () => {
                const collectionRef = doc(db, 'publicPages', router.query.id);
                const snapshot = await getDoc(collectionRef);
                setPublicPageData(snapshot.data());
            }
            getPublicPage();
        }
    }, [isListenerPage, router.query.id]);

    return (
        <>
            {isListenerPage && (
                <Meta 
                    title={`${publicPageData?.name || 'Loading...'} | Setlink`}
                    ogUrl={`https://setlink.vercel.app${router.asPath}`}
                />
            )}
            <header className={headerClassName}>
                <div className="container mx-auto flex justify-between items-center h-[60px]">
                    <Link href="/">
                        <Image
                            src="/images/Setlink_white_trance_1000x300px.png"
                            alt="Setlink Logo"
                            width={190}
                            height={50}
                            priority={true}
                        />
                    </Link>
                    {!isListenerPage && (
                        <button className="md:hidden text-white" onClick={toggleSidebar}>
                            <FaBars size={24} />
                        </button>
                    )}
                </div>
            </header>
        </>
    );
};

export default Header;
