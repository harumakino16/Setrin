import Link from 'next/link';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa'; // ReactIconをインポート
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/router';
import { db } from '@/../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

const Header = ({ toggleSidebar }) => {
    const { theme } = useTheme();
    const router = useRouter();
    const [publicPageColor, setPublicPageColor] = useState(null);

    // Determine if the current page is a listener's page
    const isListenerPage = router.pathname.startsWith('/public');
    const headerClassName = isListenerPage ? `bg-customTheme-${publicPageColor}-primary shadow-lg` : `bg-customTheme-${theme}-primary shadow-lg`;

    useEffect(() => {
        if (isListenerPage) {
            const getPublicPage = async () => {
                const collectionRef = doc(db, 'publicPages', router.query.id);
                const snapshot = await getDoc(collectionRef);
                setPublicPageColor(snapshot.data().color);
            }
            getPublicPage();
        }
    }, [isListenerPage, router.query.id]);

    return (
        <header className={headerClassName}>
            <div className="container mx-auto flex justify-between items-center h-[60px]">
                <Link href="/">
                    <Image
                        src="/images/SetLink_white_trance (1000 x 300 px).png"
                        alt="SetLink Logo"
                        width={190}
                        height={50}
                        priority={true}
                    />
                </Link>
                {!isListenerPage && ( // toggleSidebarが存在する場合のみボタンを表示
                    <button className="md:hidden text-white" onClick={toggleSidebar}>
                        <FaBars size={24} />
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
