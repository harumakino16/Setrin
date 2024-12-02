import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import PublicSongTable from '@/components/PublicSongTable';
import NoSidebarLayout from '../noSidebarLayout';

export default function PublicSongList() {
  const [songs, setSongs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    async function fetchPublicSongs() {
      if (!id) return;

      try {
        // 公開設定の取得
        const publicPagesSnapshot = await getDocs(
          query(
            collectionGroup(db, 'publicPages'),
            where('pageId', '==', id),
            where('enabled', '==', true)
          )
        );

        if (publicPagesSnapshot.empty) {
          router.push('/404');
          return;
        }

        const publicPageDoc = publicPagesSnapshot.docs[0];
        const userId = publicPageDoc.ref.parent.parent.id;
        const publicPageData = publicPageDoc.data();

        setUserInfo({
          displayName: publicPageData.displayName,
          description: publicPageData.description,
          visibleColumns: publicPageData.visibleColumns
        });

        // 曲情報の取得
        const songsRef = collection(db, 'users', userId, 'Songs');
        const songsSnapshot = await getDocs(songsRef);
        const songsData = songsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setSongs(songsData);
      } catch (error) {
        console.error('Error fetching public songs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicSongs();
  }, [id, router]);

  if (loading) return <div>Loading...</div>;

  return (
    <NoSidebarLayout>
      <div className="py-8">
        <h1 className="md:text-3xl text-2xl font-bold mb-4">{userInfo?.displayName || '名称未設定...'}</h1>
        {userInfo?.description && (
          <p className="mb-8">{userInfo.description}</p>
        )}
        <PublicSongTable
          songs={songs}
          visibleColumns={userInfo?.visibleColumns}
        />
      </div>
    </NoSidebarLayout>
  );
}