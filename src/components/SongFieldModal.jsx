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
  const [furigana, setFurigana] = useState(isNewSong ? '' : (song.furigana || ''));
  const [showDetails, setShowDetails] = useState(!isNewSong);
  const authContext = useContext(AuthContext);
  const { currentUser } = authContext || {};
  const { setMessageInfo } = useMessage();
  const { theme } = useTheme();
  const [furiganaError, setFuriganaError] = useState(false);
  const { songs } = useSongs();

  const handleSaveSong = async () => {
    if (furigana && !isKatakana(furigana)) {
      setFuriganaError(true);
      setMessageInfo({ message: 'フリガナはカタカナのみで入力してください。', type: 'error' });
      return;
    }

    const isDuplicate = songs.some(existingSong => 
      existingSong.title === title && existingSong.artist === artist
    );
    if (isNewSong && isDuplicate) {
      setMessageInfo({ message: `${title}/${artist} は既に存在します。`, type: 'error' });
      return;
    }

    if (isNewSong && songs.length >= FREE_PLAN_MAX_SONGS) {
      setMessageInfo({ message: `曲の追加が無料プランの上限(${FREE_PLAN_MAX_SONGS})を超えています。`, type: 'error' });
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
        furigana,
        createdAt: isNewSong ? new Date() : song.createdAt,
      }, isNewSong);

      try {
        if (isNewSong) {
          const userSongsCollection = collection(db, 'users', currentUser.uid, 'Songs');
          await addDoc(userSongsCollection, songData);
          setMessageInfo({ message: '曲を追加しました', type: 'success' });
        } else {
          const songDocRef = doc(db, 'users', currentUser.uid, 'Songs', song.id);
          await updateDoc(songDocRef, songData);
          setMessageInfo({ message: '曲を更新しました', type: 'success' });
        }
        onClose();
      } catch (error) {
        console.error('曲の更新に失敗しました', error);
        setMessageInfo({ message: isNewSong ? '曲の追加に失敗しました' : '曲の更新に失敗しました', type: 'error' });
      }
    } catch (error) {
      setMessageInfo({ message: error.message, type: 'error' });
    }
  };

  const Container = isNewSong ? 'div' : Modal;

  return (
    <Container isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col space-y-3 md:w-[500px]">
        <h2 className="text-xl font-bold mb-4">{isNewSong ? '新規曲登録' : '編集画面'}</h2>
        <div className="flex flex-col space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="曲名" className="input bg-gray-100 p-3 rounded" />
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="アーティスト" className="input bg-gray-100 p-3 rounded" />
          <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="カラオケ音源のYoutube URL" className="input bg-gray-100 p-3 rounded" />

          {isNewSong && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full p-2 rounded text-gray-500"
            >
              詳細入力
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
                  placeholder="曲名フリガナ（カタカナのみ）"
                  className={`input bg-gray-100 p-3 w-full rounded ${furiganaError ? 'border-red-500' : ''}`}
                />
                {furiganaError && (
                  <p className="text-red-500 text-sm mt-1">フリガナはカタカナのみで入力してください</p>
                )}
              </div>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="タグ (カンマ区切り)" className="input bg-gray-100 p-3 rounded" />
              <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="ジャンル" className="input bg-gray-100 p-3 rounded" />
              <div>歌唱回数</div>
              <input type="number" value={singingCount} onChange={(e) => setSingingCount(e.target.value)} placeholder="歌唱回数" className="input bg-gray-100 p-3 rounded" />
              <div>熟練度</div>
              <input type="number" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} placeholder="熟練度" className="input bg-gray-100 p-3 rounded" />
              <div>備考</div>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="備考" className="input bg-gray-100 p-3 rounded"></textarea>
            </>
          )}
        </div>
        <button onClick={handleSaveSong} className={`button bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold p-3 rounded mt-3`}>
          {isNewSong ? '曲を追加する' : '編集完了'}
        </button>
      </div>
    </Container>
  );
}

export default SongModal;
