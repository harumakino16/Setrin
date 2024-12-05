import { useState } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function RequestModal({ song, onClose, sessionPath }) {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    try {
      if (!sessionPath) {
        alert('現在リクエストを受け付けていません。');
        return;
      }
      const requestsRef = collection(db, sessionPath);
      await addDoc(requestsRef, {
        songId: song.id,
        songTitle: song.title,
        requesterName: name,
        timestamp: Timestamp.now()
      });
      onClose();
    } catch (error) {
      console.error('リクエストの送信中にエラーが発生しました:', error);
    }
  };

  return (
    <div className="modal">
      <h2>リクエストを送信</h2>
      <p>曲名: {song.title}</p>
      <input
        type="text"
        placeholder="あなたのお名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleSubmit}>送信</button>
      <button onClick={onClose}>キャンセル</button>
    </div>
  );
}

export default RequestModal; 