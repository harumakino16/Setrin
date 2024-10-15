import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import { AuthContext } from "@/context/AuthContext";

const SongsContext = createContext();

export const useSongs = () => useContext(SongsContext);

export const SongsProvider = ({ children }) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (currentUser) {
            const songsRef = collection(db, 'users', currentUser.uid, 'Songs');
            const q = query(songsRef);
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const songsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSongs(songsData);
                setLoading(false);
            }, (error) => {
                
                setLoading(false); // エラー時もローディングを解除
            });

            return () => unsubscribe(); // コンポーネントのアンマウント時に購読を解除
        } else {
            setSongs([]); // currentUserがnullの場合は空の配列をセット
            setLoading(false);
        }
    }, [currentUser]); // currentUserが変更された時にも効果を再実行

    if (loading) {
        return <div>Loading...</div>; // ローディング中の表示
    }

    return (
        <SongsContext.Provider value={{ songs, setSongs }}>
            {children}
        </SongsContext.Provider>
    );
};
