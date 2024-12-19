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
    const logOut = useLogOut();
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
        <div className="sidebar w-64 min-w-[256px] flex flex-col justify-between">
            <div>
                <div className="flex flex-col items-center py-4">
                    <div className="text-gray-700 text-2xl font-semibold">{t('menu')}</div>
                </div>
                <div className="mt-8">
                    <ul>
                        {MENU.map((item) => (
                            <Link key={item.titleKey} href={item.path} onClick={onLinkClick}>
                                <li className={`flex items-center text-gray-700 text-sm font-medium py-2 px-6 ${router.pathname === item.path ? 'bg-gray-200' : 'hover:bg-gray-200'} cursor-pointer gap-2`}>
                                    <FontAwesomeIcon icon={item.iconName} />{t(item.titleKey)}
                                </li>
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link href="/admin/admin_dashboard" onClick={onLinkClick}>
                                <li className="flex items-center text-gray-700 text-sm font-medium py-2 px-6 hover:bg-gray-200 cursor-pointer gap-2">
                                    <FontAwesomeIcon icon={faUserShield} />{t('adminPage')}
                                </li>
                            </Link>
                        )}
                    </ul>
                </div>
                <div className="mt-4 px-6">
                    <button onClick={handleCreateSetlist} className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-3 px-4 rounded flex items-center justify-center w-full`}>
                        {t('createSetlist')}
                    </button>
                </div>
            </div>

            <CreateRandomSetlist isOpen={showCreateSetlistModal} onClose={handleCloseModal} />
        </div>
    );
}
