import { useState } from 'react';
import Modal from './modal';
import SongFieldModal from './SongFieldModal';
import ImportModal from './ImportModal';
import YoutubePlaylistModal from './YoutubePlaylistModal'; // New component imported

const AddSongModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('manual');

    return (
        <div>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('manual')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'manual' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            手動で追加
                        </button>
                        <button
                            onClick={() => setActiveTab('csv')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'csv' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            CSVファイルから追加
                        </button>
                        <button
                            onClick={() => setActiveTab('youtube')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'youtube' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Youtubeの再生リストから追加
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
