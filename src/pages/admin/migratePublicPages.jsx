import React from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { useMessage } from '@/context/MessageContext';

export default function MigratePublicPages() {
  const { setMessageInfo } = useMessage();
  const router = useRouter();

  const handleCreatePublicPages = async () => {
    try {
      // 全ユーザーを取得
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs;

      for (const userDoc of users) {
        const userId = userDoc.id;

        // 既存のpublicPagesドキュメントを取得
        const publicPagesRef = collection(db, 'users', userId, 'publicPages');
        const publicPagesSnapshot = await getDocs(publicPagesRef);

        for (const pageDoc of publicPagesSnapshot.docs) {
          const pageData = pageDoc.data();
          const newDocId = pageDoc.id;

          // 新しいトップレベルの公開ページコレクションにドキュメントを作成
          const newPublicPageRef = doc(db, 'publicPages', newDocId);

          // ドキュメントが既に存在するか確認
          const existingDoc = await getDoc(newPublicPageRef);
          if (existingDoc.exists()) {
            console.log(`ドキュメントID: ${newDocId} は既に存在します。スキップします。`);
            continue;
          }

          const newPublicPageData = {
            name: pageData.name || '名称未設定...',
            updatedAt: new Date(),
            userId: userId
          };

          await setDoc(newPublicPageRef, newPublicPageData);

          // データの対応をコンソールに出力
          console.log(`ユーザーID: ${userId}`);
          console.log('新しい公開ページデータ:');
          console.log(newPublicPageData);
        }
      }

      setMessageInfo({ message: '公開ページの作成が完了しました。', type: 'success' });
    } catch (error) {
      console.error('公開ページ作成中にエラーが発生しました:', error);
      setMessageInfo({ message: '公開ページ作成中にエラーが発生しました。', type: 'error' });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PublicPageデータの移行</h1>
      <button
        onClick={handleCreatePublicPages}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        公開ページを作成する
      </button>
    </div>
  );
} 