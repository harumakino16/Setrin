// pages/public/[id].jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import NoSidebarLayout from '../noSidebarLayout';
import PublicSongTable from '@/components/PublicSongTable';
import { convertKanaToHira } from '@/utils/stringUtils';

export default function PublicSongList() {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]); // VTuberの条件でフィルタ済みの曲
  const [displaySongs, setDisplaySongs] = useState([]);   // 上記filteredSongsに対するユーザーの2次絞り込み後の曲
  const [userInfo, setUserInfo] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState({});
  const [loading, setLoading] = useState(true);

  const [userKeyword, setUserKeyword] = useState(''); // 2次絞り込み用キーワード

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const router = useRouter();
  const { id } = router.query;

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
      songsData = songsData.filter(song => song.tags && song.tags.map(tag => tag.toLowerCase()).includes(tagLower));
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
    async function fetchPublicSongs() {
      if (!id) return;
      try {
        // トップレベルpublicPages/{id} からuserId取得
        const topLevelRef = doc(db, 'publicPages', id);
        const topLevelDoc = await getDoc(topLevelRef);
        if (!topLevelDoc.exists()) {
          router.push('/404');
          return;
        }
        const topData = topLevelDoc.data();
        const userId = topData.userId;

        // ユーザー固有publicPages/{id}取得
        const publicPageRef = doc(db, 'users', userId, 'publicPages', id);
        const publicPageDoc = await getDoc(publicPageRef);
        if (!publicPageDoc.exists()) {
          router.push('/404');
          return;
        }

        const publicPageData = publicPageDoc.data();
        setUserInfo({
          displayName: publicPageData.name || topData.name || '名称未設定...',
          description: publicPageData.description || '',
          visibleColumns: publicPageData.visibleColumns || {
            title: true,
            artist: true,
            genre: true,
            youtubeUrl: true,
            tags: true,
            singingCount: true,
            skillLevel: true
          }
        });

        // searchCriteriaを取得
        const criteria = publicPageData.searchCriteria || {};
        setSearchCriteria(criteria);

        // ユーザーの全曲リストを取得
        const songsRef = collection(db, 'users', userId, 'Songs');
        const songsSnapshot = await getDocs(songsRef);
        const allSongs = songsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSongs(allSongs);

        const filtered = filterSongs(allSongs, criteria);
        setFilteredSongs(filtered);
        setDisplaySongs(filtered); // 初期表示はフィルタ済みの全曲

      } catch (error) {
        console.error('Error fetching public songs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicSongs();
  }, [id, router]);

  // userKeywordが変更されたら2次絞り込み
  useEffect(() => {
    if (!userKeyword) {
      // キーワードが空ならfilteredSongsをそのまま表示
      setDisplaySongs(filteredSongs);
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
        (song.furigana && convertKanaToHira(song.furigana.toLowerCase()).includes(hiraKw))
      );
      setDisplaySongs(furtherFiltered);
    }
  }, [userKeyword, filteredSongs]);

  // ソート関数
  const sortSongs = (songs, key, direction) => {
    return [...songs].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === 'title') {
        // titleカラムはfurigana優先
        aValue = a.furigana || a.title;
        bValue = b.furigana || b.title;
      }

      if (Array.isArray(aValue)) aValue = aValue.join(', ');
      if (Array.isArray(bValue)) bValue = bValue.join(', ');

      // 数値比較可能なら数値で比較
      if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        return direction === 'ascending'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      // 文字列比較
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

  if (loading) return <div>Loading...</div>;

  return (
    <NoSidebarLayout>
      <div className="py-8 w-full mx-auto px-4">
        <h1 className="md:text-3xl text-2xl font-bold mb-4">{userInfo?.displayName || '名称未設定...'}</h1>
        {userInfo?.description && (
          <p className="mb-8">{userInfo.description}</p>
        )}

        {/* 2次絞り込み用のテキスト入力欄 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="曲名、アーティスト、タグ、ジャンル、フリガナで絞り込み"
            className="border p-2 rounded w-full h-14"
            value={userKeyword}
            onChange={(e) => setUserKeyword(e.target.value)}
          />
        </div>

        <PublicSongTable
          songs={displaySongs}
          visibleColumns={userInfo?.visibleColumns}
          onRequestSort={requestSort}
          sortConfig={sortConfig}
        />
      </div>
    </NoSidebarLayout>
  );
}
