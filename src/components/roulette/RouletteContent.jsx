import { useState, useContext } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { doc, getDoc, updateDoc, increment, serverTimestamp, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import { AuthContext } from '@/context/AuthContext';

export default function RouletteContent({ currentSongs, onSpin, setlist }) {
  const { theme } = useTheme();
  const [spinning, setSpinning] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isDecided, setIsDecided] = useState(false);
  const { currentUser } = useContext(AuthContext);



  const handleSpin = () => {
    if (!currentSongs || currentSongs.length === 0) return;
    if (onSpin) {
      onSpin();
    }
    setSpinning(true);
    setSelectedSong(null);
    setIsDecided(false);

    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * currentSongs.length);
      setSelectedSong(currentSongs[randomIndex]);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        setSpinning(false);
        activityCount();
      }
    }, 100);
  };

  const handleDecide = () => {
    if (selectedSong?.youtubeUrl) {
      window.open(selectedSong.youtubeUrl, '_blank');
    }
    setIsDecided(true);
    saveRouletteHistory();
  };

  const saveRouletteHistory = async () => {
    if (!selectedSong || !currentUser) return;

    try {
      const historyRef = collection(db, 'users', currentUser.uid, 'rouletteHistory');
      await addDoc(historyRef, {
        songId: selectedSong.id,
        title: selectedSong.title,
        setlistname: setlist?.name || '未設定',
        artist: selectedSong.artist || '',
        youtubeUrl: selectedSong.youtubeUrl || '',
        decidedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to save roulette history:', error);
    }
  };

  const activityCount = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return;

      await updateDoc(userRef, {
        'userActivity.rouletteCount': increment(1),
        'userActivity.monthlyRouletteCount': increment(1),
        'userActivity.lastRouletteSessionTime': serverTimestamp(),
        'userActivity.lastActivityAt': serverTimestamp(),
      });
    } catch (error) {
      console.error('Activity count update failed:', error);
    }
  };

  const commonContainerClasses = "bg-white p-6 rounded shadow-sm space-y-6 min-h-[280px] flex flex-col";
  const commonHeaderClasses = "flex items-center justify-between h-[36px]";
  const commonContentClasses = "flex-grow flex flex-col justify-center py-4";
  const commonFooterClasses = "";

  return (
    <>
      {/* ルーレットスタート */}
      {(!selectedSong || isDecided) && !spinning && (
        <div className={commonContainerClasses}>
          <div className={commonHeaderClasses}>
            <h3 className="text-xl font-bold text-gray-800">曲を選ぶ</h3>
            <p className="text-gray-700 text-base">
              対象曲数: <span className="font-bold text-customTheme-${theme}-primary">{currentSongs.length}</span> 曲
            </p>
          </div>

          <div className={commonContentClasses}>
            {selectedSong && (
              <div className="text-2xl font-bold break-all text-center mb-8">
                {selectedSong.title}
                {selectedSong.artist && (
                  <p className="text-lg text-gray-700 text-center mt-4">
                    {selectedSong.artist}
                  </p>
                )}
              </div>
            )}
            <div className="text-center">
              <button
                onClick={handleSpin}
                className={`
                  px-8 py-4 rounded-lg text-white 
                  bg-customTheme-${theme}-primary
                  hover:bg-customTheme-${theme}-accent
                  transition-all duration-200 text-lg font-bold
                  focus:outline-none focus:ring-4 focus:ring-customTheme-${theme}-primary focus:ring-opacity-50
                `}
              >
                ルーレットスタート
              </button>
            </div>
          </div>

          <div className={commonFooterClasses} />
        </div>
      )}

      {/* 回転中のアニメーション */}
      {spinning && (
        <div className={commonContainerClasses}>
          <div className={commonHeaderClasses}>
            <h3 className="text-xl font-bold text-gray-800">選曲中...</h3>
            <p className="text-gray-700 text-base">
              対象曲数: <span className="font-bold text-customTheme-${theme}-primary">{currentSongs.length}</span> 曲
            </p>
          </div>

          <div className={commonContentClasses}>
            <div className="text-2xl font-bold text-gray-900 animate-pulse line-clamp-2 text-center">
              {selectedSong?.title || ""}
            </div>
            {selectedSong?.artist && (
              <p className="text-lg text-gray-700 animate-pulse text-center mt-4">
                {selectedSong.artist}
              </p>
            )}
          </div>

          <div className={commonFooterClasses} />
        </div>
      )}

      {/* 結果表示 */}
      {selectedSong && !spinning && !isDecided && (
        <div className={commonContainerClasses}>
          <div className={commonHeaderClasses}>
            <h3 className="text-xl font-bold text-gray-800">選ばれた曲</h3>
            <p className="text-gray-700 text-base">
              対象曲数: <span className="font-bold text-customTheme-${theme}-primary">{currentSongs.length}</span> 曲
            </p>
          </div>

          <div className={commonContentClasses}>
            <div className="relative w-full">
              <div className="text-2xl font-bold break-all text-center">
                {selectedSong.title}
              </div>
            </div>
            {selectedSong.artist && (
              <p className="text-lg text-gray-700 text-center mt-4">
                {selectedSong.artist}
              </p>
            )}
          </div>

          <div className={commonFooterClasses}>
            <div className="space-y-3">
              <button
                onClick={handleDecide}
                className={`
                  w-full py-4 rounded-lg text-white
                  bg-customTheme-${theme}-primary
                  hover:bg-customTheme-${theme}-accent
                  transition-all duration-200 font-bold
                `}
              >
                決定
              </button>
              <button
                onClick={handleSpin}
                className={`
                  w-full py-4 rounded-lg text-white
                  bg-gray-500
                  hover:bg-gray-600
                  transition-all duration-200 font-bold
                `}
              >
                もう一回
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 