import Link from 'next/link';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa'; // ReactIconをインポート
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/router';
import { db } from '@/../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { DEFAULT_META } from '@/constants/meta';

const Header = ({ toggleSidebar, meta = {} }) => {
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

    const isPublicPage = meta.isPublic ?? false;
    const finalMeta = {
        ...DEFAULT_META,
        ...meta
    };

    return (
        <>
            <Head>
                <title>{finalMeta.title}</title>
                
                {/* メタタグは公開ページの場合のみ表示 */}
                {isPublicPage && (
                    <>
                        <meta name="description" content={finalMeta.description} />
                        <meta name="keywords" content={finalMeta.keywords} />
                        <meta property="og:title" content={finalMeta.title} />
                        <meta property="og:description" content={finalMeta.description} />
                        <meta property="og:image" content={finalMeta.ogImage} />
                        <meta property="og:url" content={`${finalMeta.baseUrl}${finalMeta.path || ''}`} />
                        <meta property="og:type" content="website" />
                        <meta property="og:site_name" content="Setlink" />
                    </>
                )}

                {/* 非公開ページの場合はnoindex */}
                {!isPublicPage && (
                    <meta name="robots" content="noindex, nofollow" />
                )}

                {/* Google Analytics */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-WQ6L8VVTH3"></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-WQ6L8VVTH3');
                    `
                }} />
            </Head>
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
