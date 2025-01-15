// components/Sidebar.jsx
import { faMusic, faCog, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faUserShield, faChartLine, faList } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from '../context/AuthContext';
import useLogOut from '../hooks/logOut';
import { useMessage } from '@/context/MessageContext';
import CreateRandomSetlist from '@/components/CreateRandomSetlist';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'next-i18next';

const MENU = [
    { titleKey: "songList", iconName: faMusic, path: "/" },
    { titleKey: "setlist", iconName: faHistory, path: "/setlist" },
    { titleKey: "publicListManagement", iconName: faList, path: "/pubpagesetting" },
    { titleKey: "singingTool", iconName: faMicrophone, path: "/utawakutool" },
    { titleKey: "dashboard", iconName: faChartLine, path: "/dashboard" },
    { titleKey: "settings", iconName: faCog, path: "/setting" },
];

export function Sidebar({ onLinkClick }) {
    const router = useRouter();
    const { currentUser, isAdmin } = useContext(AuthContext);
    const { setMessageInfo } = useMessage();
    const [showCreateSetlistModal, setShowCreateSetlistModal] = useState(false);
    const { theme } = useTheme();
    const { t } = useTranslation('common'); // 翻訳フック

    const handleCreateSetlist = () => {
        setShowCreateSetlistModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateSetlistModal(false);
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="sidebar w-64 min-w-[256px] flex flex-col justify-between min-h-screen">
            <div>
                <div className="flex flex-col items-center py-6">
                    <div className="text-gray-800 text-2xl font-bold tracking-tight">
                        {t('menu')}
                    </div>
                </div>
                <nav className="mt-4">
                    <ul className="space-y-1">
                        {MENU.map((item) => (
                            <Link key={item.titleKey} href={item.path} onClick={onLinkClick}>
                                <li className={`flex items-center text-gray-700 text-base py-3 px-6 transition-all duration-200 ease-in-out
                                    ${router.pathname === item.path 
                                        ? `bg-gray-100 text-customTheme-${theme}-primary font-bold` 
                                        : `hover:bg-gray-50`} 
                                    cursor-pointer`}>
                                    <div className="w-9 flex justify-center">
                                        <FontAwesomeIcon icon={item.iconName} className={`text-lg ${router.pathname === item.path ? `text-customTheme-${theme}-primary` : 'text-gray-500'}`} />
                                    </div>
                                    <span className="text-sm">{t(item.titleKey)}</span>
                                </li>
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link href="/admin/admin_dashboard" onClick={onLinkClick}>
                                <li className="flex items-center text-gray-700 text-base font-medium py-3 px-6 transition-all duration-200 ease-in-out hover:bg-gray-50 hover:text-customTheme-${theme}-primary cursor-pointer">
                                    <div className="w-9 flex justify-center">
                                        <FontAwesomeIcon icon={faUserShield} className="text-lg text-gray-500" />
                                    </div>
                                    <span className="text-sm">{t('adminPage')}</span>
                                </li>
                            </Link>
                        )}
                    </ul>
                </nav>
                <div className="mt-6 px-4">
                    <button 
                        onClick={handleCreateSetlist} 
                        className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center w-full transition-all duration-200 hover:translate-y-[-2px]`}
                    >
                        <FontAwesomeIcon icon={faList} className="mr-3 text-lg" />
                        {t('createSetlist')}
                    </button>
                </div>
            </div>

            <CreateRandomSetlist isOpen={showCreateSetlistModal} onClose={handleCloseModal} />
        </div>
    );
}
