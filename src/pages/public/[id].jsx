import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import PublicSongTable from '@/components/PublicSongTable';

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
        // ユーザー情報の取得
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('publicPage.pageId', '==', id));
        const userSnapshot = await getDocs(q);
        
        if (userSnapshot.empty || !userSnapshot.docs[0].data().publicPage.enabled) {
          router.push('/404');
          return;
        }

        const userData = userSnapshot.docs[0].data();
        setUserInfo({
          displayName: userData.publicPage.displayName,
          description: userData.publicPage.description,
          visibleColumns: userData.publicPage.visibleColumns
        });

        // 曲情報の取得
        const songsRef = collection(db, 'users', userSnapshot.docs[0].id, 'Songs');
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{userInfo?.displayName}の持ち歌リスト</h1>
      {userInfo?.description && (
        <p className="mb-8">{userInfo.description}</p>
      )}
      <PublicSongTable songs={songs} visibleColumns={userInfo?.visibleColumns} />
    </div>
  );
}