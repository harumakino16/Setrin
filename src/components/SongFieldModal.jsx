import { useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import Modal from './Modal';
import { useMessage } from '../context/MessageContext';
import { useTheme } from '../context/ThemeContext';
import { formatSongData } from '../utils/songUtils';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FREE_PLAN_MAX_SONGS } from '@/constants';
import { useSongs } from '../context/SongsContext';
import { useTranslation } from 'next-i18next';

const isKatakana = (str) => {
  return /^[ァ-ヶー　]*$/.test(str || '');
};

function SongModal({ isOpen, onClose, song }) {
  const isNewSong = !song;
  const [title, setTitle] = useState(isNewSong ? '' : song.title);
  const [artist, setArtist] = useState(isNewSong ? '' : song.artist);
  const [tags, setTags] = useState(isNewSong ? '' : song.tags.join(', '));
  const [genre, setGenre] = useState(isNewSong ? '' : song.genre);
  const [youtubeUrl, setYoutubeUrl] = useState(isNewSong ? '' : song.youtubeUrl);
  const [singingCount, setSingingCount] = useState(isNewSong ? 0 : song.singingCount);
  const [skillLevel, setSkillLevel] = useState(isNewSong ? 0 : song.skillLevel);
  const [memo, setMemo] = useState(isNewSong ? '' : song.memo);
  const [note, setNote] = useState(isNewSong ? '' : song.note);
  const [furigana, setFurigana] = useState(isNewSong ? '' : (song.furigana || ''));
  const [showDetails, setShowDetails] = useState(!isNewSong);
  const authContext = useContext(AuthContext);
  const { currentUser } = authContext || {};
  const { setMessageInfo } = useMessage();
  const { theme } = useTheme();
  const [furiganaError, setFuriganaError] = useState(false);
  const { songs } = useSongs();
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const { t } = useTranslation('common');

  const handleSaveSong = async () => {
    if (furigana && !isKatakana(furigana)) {
      setFuriganaError(true);
      setMessageInfo({ message: t('furiganaKatakanaOnly'), type: 'error' });
      return;
    }

    const isDuplicate = songs.some(existingSong => 
      existingSong.title === title && existingSong.artist === artist
    );
    if (isNewSong && isDuplicate && !showDuplicateConfirm) {
      setShowDuplicateConfirm(true);
      return;
    }

    if (isNewSong && songs.length >= FREE_PLAN_MAX_SONGS) {
      setMessageInfo({ message: t('freePlanSongLimitExceeded', { count: FREE_PLAN_MAX_SONGS }), type: 'error' });
      return;
    }

    setFuriganaError(false);

    try {
      const songData = formatSongData({
        title,
        artist,
        tags,
        genre,
        youtubeUrl,
        singingCount,
        skillLevel,
        memo,
        note,
        furigana,
        createdAt: isNewSong ? new Date() : song.createdAt,
      }, isNewSong);

      try {
        if (isNewSong) {
          const userSongsCollection = collection(db, 'users', currentUser.uid, 'Songs');
          await addDoc(userSongsCollection, songData);
          setMessageInfo({ message: t('songAdded'), type: 'success' });
        } else {
          const songDocRef = doc(db, 'users', currentUser.uid, 'Songs', song.id);
          await updateDoc(songDocRef, songData);
          setMessageInfo({ message: t('songUpdated'), type: 'success' });
        }
        onClose();
      } catch (error) {
        console.error(t('songUpdateFailed'), error);
        setMessageInfo({ message: isNewSong ? t('songAddFailed') : t('songUpdateFailed'), type: 'error' });
      }
    } catch (error) {
      setMessageInfo({ message: error.message, type: 'error' });
    }
  };

  const Container = isNewSong ? 'div' : Modal;

  return (
    <Container isOpen={isOpen} onClose={onClose}>
      {showDuplicateConfirm ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{t('duplicateConfirmation')}</h3>
            <p className="mb-6">{t('songArtistAlreadyExists', { title, artist })}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDuplicateConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  setShowDuplicateConfirm(false);
                  handleSaveSong();
                }}
                className={`px-4 py-2 bg-customTheme-${theme}-primary text-white rounded hover:bg-customTheme-${theme}-accent`}
              >
                {t('register')}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-3 md:w-[500px]">
          <h2 className="text-xl font-bold mb-4">{isNewSong ? t('newSongRegistration') : t('editScreen')}</h2>
          <div className="flex flex-col space-y-3">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('songTitle')} className="input bg-gray-100 p-3 rounded" />
            <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder={t('artist')} className="input bg-gray-100 p-3 rounded" />
            <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder={t('youtubeUrlPlaceholder')} className="input bg-gray-100 p-3 rounded" />

            {isNewSong && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full p-2 rounded text-gray-500"
              >
                {t('detailsInput')}
                {showDetails ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            )}
            {(!isNewSong || showDetails) && (
              <>
                <div>
                  <input
                    type="text"
                    value={furigana}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFurigana(newValue);
                      setFuriganaError(newValue && !isKatakana(newValue));
                    }}
                    placeholder={t('songFuriganaKatakanaOnly')}
                    className={`input bg-gray-100 p-3 w-full rounded ${furiganaError ? 'border-red-500' : ''}`}
                  />
                  {furiganaError && (
                    <p className="text-red-500 text-sm mt-1">{t('furiganaKatakanaOnly')}</p>
                  )}
                </div>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t('tagsCommaSeparated')} className="input bg-gray-100 p-3 rounded" />
                <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder={t('genre')} className="input bg-gray-100 p-3 rounded" />
                <div>{t('singingCount')}</div>
                <input type="number" value={singingCount} onChange={(e) => setSingingCount(e.target.value)} placeholder={t('singingCount')} className="input bg-gray-100 p-3 rounded" />
                <div>{t('skillLevel')}</div>
                <input type="number" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} placeholder={t('skillLevel')} className="input bg-gray-100 p-3 rounded" />
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">{t('note')}</label>
                  <textarea
                    name="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('note')}
                    className="input bg-gray-100 p-3 rounded w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">{t('memo')}</label>
                  <textarea
                    name="memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder={t('memo')}
                    className="input bg-gray-100 p-3 rounded w-full"
                  />
                </div>
              </>
            )}
          </div>
          <button onClick={handleSaveSong} className={`button bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold p-3 rounded mt-3`}>
            {isNewSong ? t('addSong') : t('editComplete')}
          </button>
        </div>
      )}
    </Container>
  );
}

export default SongModal;
