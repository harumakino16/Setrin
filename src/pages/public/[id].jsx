// pages/public/[id].jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, collection, getDocs, onSnapshot, addDoc } from 'firebase/firestore';
import NoSidebarLayout from '../noSidebarLayout';
import PublicSongTable from '@/components/PublicSongTable';
import { convertKanaToHira } from '@/utils/stringUtils';
import { useMessage } from '@/context/MessageContext';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { FaSearch } from 'react-icons/fa';
import Loading from '@/components/loading';
import { NextSeo } from 'next-seo';
import Cookies from 'js-cookie';


export default function PublicSongList() {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState({});
  const [loading, setLoading] = useState(true);
  const { setMessageInfo } = useMessage();
  const [color,setColor] = useState('blue');
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [pageUrl, setPageUrl] = useState('');

  const [userKeyword, setUserKeyword] = useState('');

  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'ascending' });

  const router = useRouter();
  const { id } = router.query;

  // リクエスト関連
  const [isRequestingSong, setIsRequestingSong] = useState(false);
  const [requestTargetSong, setRequestTargetSong] = useState(null);
  const [requesterName, setRequesterName] = useState('');

  const [isFirstTime, setIsFirstTime] = useState(false);
  const meta = {
    title: `${pageTitle} | Setlink`,
    description: `${pageTitle}の公開リストページです。`,
    path: `/public/${id}`,
    ogImage: 'https://setlink.jp/images/bunner.png',
    isPublic: true
  };

  // 送信中の状態を管理するための state を追加
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filterSongs = (allSongs, criteria) => {
    let songsData = [...allSongs];
    const keywordLower = criteria.freeKeyword?.toLowerCase() || '';
    const keywordHira = convertKanaToHira(keywordLower);

    if (keywordLower) {
      songsData = songsData.filter(song =>
        (song.title && song.title.toLowerCase().includes(keywordLower)) ||
        (song.artist && song.artist.toLowerCase().includes(keywordLower)) ||
        (song.tags && song.tags.some(tag => tag.toLowerCase().includes(keywordLower))) ||
        (song.genre && song.genre.toLowerCase().includes(keywordLower)) ||
        (song.skillLevel && song.skillLevel.toString().toLowerCase().includes(keywordLower)) ||
        (song.memo && song.memo.toLowerCase().includes(keywordLower)) ||
        (song.note && song.note.toLowerCase().includes(keywordLower)) ||
        (song.furigana && convertKanaToHira(song.furigana.toLowerCase()).includes(keywordHira))
      );
    }

    if (criteria.maxSung > 0) {
      if (criteria.maxSungOption === '以上') {
        songsData = songsData.filter(song => song.singingCount >= criteria.maxSung);
      } else {
        songsData = songsData.filter(song => song.singingCount <= criteria.maxSung);
      }
    }

    if (criteria.tag) {
      const tagLower = criteria.tag.toLowerCase();
      songsData = songsData.filter(song => song.tags && song.tags.map(t => t.toLowerCase()).includes(tagLower));
    }

    if (criteria.artist) {
      const artistLower = criteria.artist.toLowerCase();
      songsData = songsData.filter(song => song.artist && song.artist.toLowerCase().includes(artistLower));
    }

    if (criteria.genre) {
      const genreLower = criteria.genre.toLowerCase();
      songsData = songsData.filter(song => song.genre && song.genre.toLowerCase().includes(genreLower));
    }

    if (criteria.skillLevel > 0) {
      if (criteria.skillLevelOption === '以上') {
        songsData = songsData.filter(song => song.skillLevel && song.skillLevel >= criteria.skillLevel);
      } else {
        songsData = songsData.filter(song => song.skillLevel && song.skillLevel <= criteria.skillLevel);
      }
    }

    if (criteria.memo) {
      const memoLower = criteria.memo.toLowerCase();
      songsData = songsData.filter(song => song.memo && song.memo.toLowerCase().includes(memoLower));
    }

    if (criteria.excludedTags) {
      const excludedTags = criteria.excludedTags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
      if (excludedTags.length > 0) {
        songsData = songsData.filter(song =>
          !(song.tags && song.tags.some(tag => excludedTags.includes(tag.toLowerCase())))
        );
      }
    }

    if (criteria.excludedGenres) {
      const excludedGenres = criteria.excludedGenres.split(',').map(genre => genre.trim().toLowerCase()).filter(Boolean);
      if (excludedGenres.length > 0) {
        songsData = songsData.filter(song =>
          !excludedGenres.includes(song.genre && song.genre.toLowerCase())
        );
      }
    }

    return songsData;
  };

  useEffect(() => {
    if (!id) return;
    let unsubscribeTopPage = null;
    let unsubscribeUserPage = null;

    async function fetchInitialData() {
      const topLevelRef = doc(db, 'publicPages', id);
      const topLevelDoc = await getDoc(topLevelRef);
      if (!topLevelDoc.exists()) {
        router.push('/404');
        return;
      }
      const topData = topLevelDoc.data();
      const userId = topData.userId;
      setColor(topData.color || 'blue');

      // リアルタイムリスナー: ユーザーのpublicPages/{id}へ
      const publicPageRef = doc(db, 'users', userId, 'publicPages', id);

      unsubscribeUserPage = onSnapshot(publicPageRef, async (publicPageSnap) => {
        if (!publicPageSnap.exists()) {
          router.push('/404');
          return;
        }
        const publicPageData = publicPageSnap.data();
        setPageTitle(publicPageData.name || '公開リスト');
        setPageDescription(publicPageData.description || 'Setlinkで公開されている楽曲リストです。');
        setPageUrl(`https://setlink.jp/public/${id}`);

        // 検索条件やカラム表示は初回読み込み時のみ設定
        if (!userInfo) {
          const criteria = publicPageData.searchCriteria || {};
          setSearchCriteria(criteria);

          // ユーザーの全曲リスト取得(初回のみ)
          const songsRef = collection(db, 'users', userId, 'Songs');
          const songsSnapshot = await getDocs(songsRef);
          const allSongs = songsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSongs(allSongs);

          const filtered = filterSongs(allSongs, criteria);
          setFilteredSongs(filtered);
          setDisplaySongs(filtered);

          setUserInfo({
            displayName: publicPageData.name || topData.name || '名称未設定...',
            description: publicPageData.showDescription !== false ? publicPageData.description : '',
            visibleColumns: publicPageData.visibleColumns || {
              title: true,
              artist: true,
              genre: true,
              youtubeUrl: true,
              tags: true,
              singingCount: true,
              skillLevel: true
            },
            requestMode: publicPageData.requestMode || false,
            userId: userId
          });
          setLoading(false);
        } else {
          // 2回目以降はrequestModeのみ更新すればOK
          setUserInfo((prev) => ({
            ...prev,
            requestMode: publicPageData.requestMode || false
          }));
        }
      });
    }

    fetchInitialData();

    return () => {
      if (unsubscribeTopPage) unsubscribeTopPage();
      if (unsubscribeUserPage) unsubscribeUserPage();
    };
  }, [id, router]);

  useEffect(() => {
    if (!userKeyword) {
      const sorted = sortSongs(filteredSongs, sortConfig.key, sortConfig.direction);
      setDisplaySongs(sorted);
    } else {
      const kw = userKeyword.toLowerCase();
      const hiraKw = convertKanaToHira(kw);
      const furtherFiltered = filteredSongs.filter(song =>
        (song.title && song.title.toLowerCase().includes(kw)) ||
        (song.artist && song.artist.toLowerCase().includes(kw)) ||
        (song.tags && song.tags.some(tag => tag.toLowerCase().includes(kw))) ||
        (song.genre && song.genre.toLowerCase().includes(kw)) ||
        (song.skillLevel && song.skillLevel.toString().toLowerCase().includes(kw)) ||
        (song.memo && song.memo.toLowerCase().includes(kw)) ||
        (song.note && song.note.toLowerCase().includes(kw)) ||
        (song.furigana && convertKanaToHira(song.furigana.toLowerCase()).includes(hiraKw))
      );
      const sorted = sortSongs(furtherFiltered, sortConfig.key, sortConfig.direction);
      setDisplaySongs(sorted);
    }
  }, [userKeyword, filteredSongs, sortConfig]);

  const sortSongs = (songs, key, direction) => {
    return [...songs].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'title') {
        aValue = a.furigana || a.title;
        bValue = b.furigana || b.title;
      }

      if (Array.isArray(aValue)) aValue = aValue.join(', ');
      if (Array.isArray(bValue)) bValue = bValue.join(', ');

      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return direction === 'ascending'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      return direction === 'ascending'
        ? String(aValue || '').localeCompare(String(bValue || ''))
        : String(bValue || '').localeCompare(String(aValue || ''));
    });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    const sorted = sortSongs(displaySongs, key, direction);
    setSortConfig({ key, direction });
    setDisplaySongs(sorted);
  };

  const handleRequestClick = (song) => {
    setRequestTargetSong(song);
    setIsRequestingSong(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestTargetSong) return;
    
    setIsSubmitting(true); // 送信開始時にフラグを立てる
    
    try {
        const requestedAt = new Date();
        const requestsRef = collection(db, 'users', userInfo.userId, 'publicPages', id, 'requests');
        await addDoc(requestsRef, {
            songId: requestTargetSong.id,
            songTitle: requestTargetSong.title,
            requesterName: requesterName || '匿名',
            requestedAt,
            consumed: false,
            publicPageId: id,
            isFirstTime
        });

        // 通知設定を確認してメール送信
        const pageRef = doc(db, 'users', userInfo.userId, 'publicPages', id);
        const pageDoc = await getDoc(pageRef);
        if (pageDoc.exists()) {
            const settings = pageDoc.data().notificationSettings || {};
            if (settings.requestNotification && settings.email) {
                await fetch('/api/send-request-notification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: settings.email,
                        songTitle: requestTargetSong.title,
                        requesterName: requesterName || '匿名',
                        pageName: userInfo.displayName,
                        pageUrl: `${window.location.origin}/utawakutool/request-utawaku`,
                        isFirstTime,
                        requestedAt,
                        color,
                    }),
                });
            }
        }

        setMessageInfo({ type: 'success', message: 'リクエストを送信しました。' });
        setIsRequestingSong(false);
        setRequestTargetSong(null);
        setRequesterName('');
        setIsFirstTime(false);
    } catch (error) {
        console.error('リクエスト送信エラー:', error);
        setMessageInfo({ type: 'error', message: 'リクエストの送信に失敗しました。' });
    } finally {
        setIsSubmitting(false); // 送信完了時にフラグを戻す
    }
  };

  if (loading) return <Loading />;

  const requestMode = userInfo?.requestMode || false;

  return (
    <>
      <NextSeo
        title={`${pageTitle} | Setlink`}
        description={pageDescription}
        openGraph={{
          title: `${pageTitle} | Setlink`,
          description: pageDescription,
          url: pageUrl,
          type: 'website',
          images: [
            {
              url: 'https://setlink.jp/images/bunner.png',
              width: 1200,
              height: 630,
              alt: 'Setlink',
            },
          ],
        }}
        twitter={{
          cardType: 'summary_large_image',
        }}
      />
      <NoSidebarLayout meta={meta}>
        <div className="py-8 w-full mx-auto px-4">
          <h1 className="md:text-3xl text-2xl font-bold mb-4">
            {userInfo?.displayName || '名称未設定...'}
          </h1>
          {userInfo?.description && (
            <div className="mb-8 w-full">
              <div className="bg-white p-6 rounded-lg border border-gray-200m">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {userInfo.description}
                </p>
              </div>
            </div>
          )}

          {/* 2次絞り込み */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="曲名、アーティスト、タグ、ジャンル、フリガナで絞り込み"
              className="border p-2 pl-12 rounded w-full h-14"
              value={userKeyword}
              onChange={(e) => setUserKeyword(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>

          <PublicSongTable
            songs={displaySongs}
            originalSongs={filteredSongs}
            visibleColumns={userInfo?.visibleColumns}
            onRequestSort={requestSort}
            sortConfig={sortConfig}
            extraAction={
              requestMode
                ? (song) => (
                    <button
                      className={`text-white bg-customTheme-${color}-primary px-2 py-1 rounded hover:opacity-80 transition-opacity duration-300`}
                      onClick={() => handleRequestClick(song)}
                    >
                      リクエスト
                    </button>
                  )
                : null
            }
          />

          {isRequestingSong && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">リクエスト</h2>
                {(() => {
                  const cookieKey = `request_${id}_${requestTargetSong?.id}`;
                  const lastRequestTime = Cookies.get(cookieKey);
                  
                  if (lastRequestTime) {
                    const lastTime = new Date(parseInt(lastRequestTime));
                    const now = new Date();
                    const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));
                    const remainingMinutes = 60 - diffMinutes;
                    
                    if (remainingMinutes > 0) {
                      return (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                          この曲は既にリクエスト済みです。<br />
                          次のリクエストは{remainingMinutes}分後に可能になります。
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                <p className="mb-4">「{requestTargetSong?.title}」をリクエストします。<br />お名前を入力してください (任意)</p>
                

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="firstTimeCheck"
                    checked={isFirstTime}
                    onChange={(e) => setIsFirstTime(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="firstTimeCheck">初見です！</label>
                </div>
                <input
                  type="text"
                  className="border p-2 w-full rounded mb-4"
                  placeholder="お名前（空欄で匿名）"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                />
                
                <div className="flex flex-col gap-2">
                  {(() => {
                    const cookieKey = `request_${id}_${requestTargetSong?.id}`;
                    const lastRequestTime = Cookies.get(cookieKey);
                    const isDisabled = (() => {
                      if (lastRequestTime) {
                        const lastTime = new Date(parseInt(lastRequestTime));
                        const now = new Date();
                        const diffMinutes = Math.floor((now - lastTime) / (1000 * 60));
                        return diffMinutes < 60;
                      }
                      return false;
                    })();

                    return (
                      <button
                        onClick={handleSubmitRequest}
                        disabled={isDisabled || isSubmitting}
                        className={`w-full px-4 py-3 rounded relative ${
                          isDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : `bg-customTheme-${color}-primary text-white hover:opacity-80 transition-opacity duration-300`
                        } ${isSubmitting ? 'opacity-70' : ''}`}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="opacity-0">送信</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            </div>
                          </>
                        ) : (
                          '送信'
                        )}
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => setIsRequestingSong(false)}
                    disabled={isSubmitting}
                    className={`bg-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-400 w-1/2 mx-auto ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </NoSidebarLayout>
    </>
  );
}
// 静的パスを生成するための新しいメソッド
export async function getStaticPaths({ locales }) {
  return {
      paths: [], // 空の配列で、すべてのパスを動的に生成
      fallback: 'blocking' // サーバーサイドでページを生成
  };
}

export async function getStaticProps({ params, locale }) {
  return {
      props: {
          ...(await serverSideTranslations(locale, ['common'])),
      },
      revalidate: 60 // 必要に応じて、ページを再生成する間隔（秒）
  };
}