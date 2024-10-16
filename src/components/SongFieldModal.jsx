import { useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import Modal from './modal';
import { useMessage } from '../context/MessageContext';
import { formatSongData } from '../utils/songUtils';


function SongModal({ isOpen, onClose, song }) {
  const isNewSong = !song;
  const [title, setTitle] = useState(isNewSong ? '' : song.title);
  const [artist, setArtist] = useState(isNewSong ? '' : song.artist);
  const [tags, setTags] = useState(isNewSong ? '' : song.tags.join(', '));
  const [genre, setGenre] = useState(isNewSong ? '' : song.genre);
  const [youtubeUrl, setYoutubeUrl] = useState(isNewSong ? '' : song.youtubeUrl);
  const [singingCount, setsingingCount] = useState(isNewSong ? 0 : song.singingCount);
  const [skillLevel, setSkillLevel] = useState(isNewSong ? 0 : song.skillLevel); // 熟練度の状態を追加
  const [memo, setMemo] = useState(isNewSong ? '' : song.memo); // 備考の状態を追加
  const authContext = useContext(AuthContext);
  const { currentUser } = authContext || {};
  const { setMessageInfo } = useMessage();


  const handleSaveSong = async () => {
    try {
      const songData = formatSongData({
        title,
        artist,
        tags,
        genre,
        youtubeUrl,
        singingCount,
        skillLevel,
        memo
      });



      try {
        if (isNewSong) {
          const userSongsCollection = collection(db, 'users', currentUser.uid, 'Songs');
          await addDoc(userSongsCollection, songData);
          setMessageInfo({ message: isNewSong ? '曲を追加しました' : '曲を更新しました', type: 'success' });

        } else {
          const songDocRef = doc(db, 'users', currentUser.uid, 'Songs', song.id);
          await updateDoc(songDocRef, songData);
        }
        onClose();
      } catch (error) {
        
        setMessageInfo({ message: isNewSong ? '曲の追加に失敗しました' : '曲の更新に失敗しました', type: 'error' });
      }
    } catch (error) {
      setMessageInfo({ message: error.message, type: 'error' });
    }
  };

  const Container = isNewSong ? 'div' : Modal;

  return (
    <Container isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col space-y-3">
        <h2 className="text-xl font-bold mb-4">{isNewSong ? '新規曲登録' : '編集画面'}</h2>
        <div className="flex flex-col space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="曲名" className="input bg-gray-100 p-3 rounded" />
          <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="アーティスト" className="input bg-gray-100 p-3 rounded" />
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="タグ (カンマ区切り)" className="input bg-gray-100 p-3 rounded" />
          <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="ジャンル" className="input bg-gray-100 p-3 rounded" />
          <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="カラオケ音源のYoutube URL" className="input bg-gray-100 p-3 rounded" />
          {!isNewSong && (
            <input type="number" value={singingCount} onChange={(e) => setsingingCount(e.target.value)} placeholder="歌唱回数" className="input bg-gray-100 p-3 rounded" />
          )}
          <div>熟練度</div>
          <input type="number" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} placeholder="熟練度" className="input bg-gray-100 p-3 rounded" />
          <div>備考</div>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="備考" className="input bg-gray-100 p-3 rounded"></textarea>
        </div>
        <button onClick={handleSaveSong} className="button bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded mt-3">{isNewSong ? '曲を追加する' : '編集完了'}</button>
      </div>
    </Container>
  );
}

export default SongModal;