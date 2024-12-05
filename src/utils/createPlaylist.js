import { updateDoc, increment, doc } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import { YOUTUBE_CREATE_LIST_LIMIT } from '@/constants';

export async function createPlaylist(songs, setlistName, currentUser, setMessageInfo, setLoading, router) {
    setLoading(true); // ローディング開始
    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    };

    const invalidUrls = songs.filter(song => !isValidUrl(song.youtubeUrl));
    if (invalidUrls.length > 0) {
        const invalidTitles = invalidUrls.map(song => `・ ${song.title}`).join('\n');
        setMessageInfo({ message: `エラー：無効なURLが含まれています。\n${invalidTitles}`, type: 'error' });
        setLoading(false); // ローディング終了
        return;
    }

    // 現在の日付を取得
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    if (currentUser.plan === 'free') {
        // 月初めにカウントをリセット
        if (!currentUser.planUpdatedAt || currentUser.planUpdatedAt.toDate() < firstDayOfMonth) {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                playlistCreationCount: 0,
                planUpdatedAt: currentDate,
            });
            currentUser.playlistCreationCount = 0; // ローカルのデータも更新
        }

        if (currentUser.playlistCreationCount >= YOUTUBE_CREATE_LIST_LIMIT) {
            if (confirm(`無料プランでは月に${YOUTUBE_CREATE_LIST_LIMIT}回まで再生リストを作成できます。有料プランにアップグレードしますか？`)) {
                router.push('/setting');
            }
            return;
        }

        // 作成回数をインクリメント
        await updateDoc(doc(db, 'users', currentUser.uid), {
            playlistCreationCount: increment(1),
        });
        currentUser.playlistCreationCount += 1; // ローカルのデータも更新
    }

    try {
        const refreshTokenResponse = await fetch('/api/refreshAccessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: currentUser.youtubeRefreshToken }),
        });

        if (!refreshTokenResponse.ok) {
            setMessageInfo({ message: 'エラー：再生リストの作成中にエラーが発生しました', type: 'error' });
            throw new Error('Failed to refresh access token');
        }

        const { accessToken } = await refreshTokenResponse.json();

        const videoUrls = songs.map(song => song.youtubeUrl);
        const songTitles = songs.map(song => song.title);
        const response = await fetch('/api/createPlaylist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: accessToken, videoUrls, songTitles, setlistName }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 403 && errorData.message.includes('YouTubeアカウントが停止または削除されています')) {
                setMessageInfo({ message: 'YouTubeアカウントが停止または削除されています。設定ページでYouTube連携を解除し、有効なアカウントで再連携してください。', type: 'error' });
            } else {
                setMessageInfo({ message: errorData.message, type: 'error' });
            }
            throw new Error(errorData.message);
        }

        const data = await response.json();

        setMessageInfo({ message: '再生リストを作成しました', type: 'success' });
    } catch (error) {
        setMessageInfo({ message: error.message, type: 'error' });
    } finally {
        setLoading(false); // ローディング終了
    }
}