import { useContext, useState } from 'react';
import Modal from './Modal';
import SongFieldModal from './SongFieldModal';
import ImportModal from './ImportModal';
import YoutubePlaylistModal from './YoutubePlaylistModal'; // New component imported
import { AuthContext } from "@/context/AuthContext";
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'next-i18next'; // 翻訳フックをインポート


const AddSongModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('manual');
    const { currentUser } = useContext(AuthContext);
    const { theme } = useTheme();
    const { t } = useTranslation('common'); // 翻訳フックを初期化

    return (
        <div>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className={`border-b border-gray-200`}>
                    <nav className="-mb-px flex flex-wrap space-x-4 md:space-x-8">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'manual' ? `border-customTheme-${theme}-primary text-customTheme-${theme}-primary` : `border-transparent text-gray-500 hover:text-customTheme-${theme}-primary hover:border-customTheme-${theme}-primary`}`}
                        >
                            {t('addManually')}
                        </button>
                        <button
                            onClick={() => setActiveTab('csv')}
                            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'csv' ? `border-customTheme-${theme}-primary text-customTheme-${theme}-primary` : `border-transparent text-gray-500 hover:text-customTheme-${theme}-primary hover:border-customTheme-${theme}-primary`}`}
                        >
                            {t('addFromCSV')}
                        </button>
                        <button
                            onClick={() => setActiveTab('youtube')}
                            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'youtube' ? `border-customTheme-${theme}-primary text-customTheme-${theme}-primary` : `border-transparent text-gray-500 hover:text-customTheme-${theme}-primary hover:border-customTheme-${theme}-primary`}`}
                        >
                            {t('addFromYoutubePlaylist')}
                        </button>
                    </nav>
                </div>
                <div className="tab-content mt-4">
                    {activeTab === 'manual' && <SongFieldModal isOpen={true} onClose={onClose} />}
                    {activeTab === 'csv' && <ImportModal isOpen={true} onClose={onClose} />}
                    {activeTab === 'youtube' && <YoutubePlaylistModal isOpen={true} onClose={onClose} />}
                </div>
            </Modal>
        </div>
    );
};

export default AddSongModal;
