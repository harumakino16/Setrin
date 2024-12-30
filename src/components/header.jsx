import Link from 'next/link';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa'; // ReactIconをインポート
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'next/router';
import { db } from '@/../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Head from 'next/head';

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
            <Head>
                {/* Google tag (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-WQ6L8VVTH3"></script>
                <script>
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-WQ6L8VVTH3');
                    `}
                </script>

                {/* Dynamic title and OGP tags */}
                <title>{isListenerPage ? `${publicPageData?.name || 'Loading...'} | Setlink` : 'Setlink'}</title>
                <meta property="og:title" content={isListenerPage ? `${publicPageData?.name || 'Loading...'} | Setlink` : 'Setlink'} />
                <meta property="og:description" content="歌枠をもっと楽しく、もっと便利に" />
                <meta name="description" content="SetlinkはVtuber向けに特化した歌枠サポートツールです。自分が歌える曲を簡単に管理し、公開リストを通じてリスナーからのリクエスト受付もスムーズに実現できます。これまで手間だったセットリスト作成が楽になり、リクエスト歌枠がもっと楽しくなる、歌枠をメインに活動するVtuberに最適なアプリです。" />
                <meta name="keywords" content="Vtuber, 歌枠, セトリ, YouTube, 再生リスト, 管理ツール" />
                <meta property="og:image" content="https://setlink.vercel.app/images/bunner.png" />
                <meta property="og:url" content={`https://setlink.vercel.app${router.asPath}`} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Setlink" />
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
