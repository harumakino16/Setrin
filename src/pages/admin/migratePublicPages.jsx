import React from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useMessage } from '@/context/MessageContext';

export default function MigratePublicPages() {
  const { setMessageInfo } = useMessage();
  const router = useRouter();

  const handleMigration = async () => {
    try {
      // 全ユーザーを取得
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs;

      for (const userDoc of users) {
        const userId = userDoc.id;

        // 古い設定データを取得
        const oldSettingsRef = doc(db, 'users', userId, 'publicPages', 'settings');
        const oldSettingsDoc = await getDoc(oldSettingsRef);

        if (oldSettingsDoc.exists()) {
          const oldData = oldSettingsDoc.data();

          // 旧pageIdを使用し、存在しない場合は新しいUUIDを生成
          const newDocId = oldData.pageId || crypto.randomUUID();

          // 新しいデータを作成
          const initialCriteria = {
            artist: '',
            excludedGenres: '',
            excludedTags: '',
            freeKeyword: '',
            genre: '',
            maxSung: 0,
            maxSungOption: '以下',
            memo: '',
            skillLevel: 0,
            skillLevelOption: '以下',
            tag: ''
          };

          const newData = {
            createdAt: new Date(),
            name: oldData.displayName || '名称未設定...',
            visibleColumns: oldData.visibleColumns || [],
            savedSearchCriteria: initialCriteria,
            searchCriteria: initialCriteria
          };

          // 新しいドキュメントにデータを書き込む
          const newDocRef = doc(db, 'users', userId, 'publicPages', newDocId);
          await setDoc(newDocRef, newData);

          // 古い設定ドキュメントを削除
          await deleteDoc(oldSettingsRef);

          // データの対応をコンソールに出力
          console.log(`ユーザーID: ${userId}`);
          console.log('旧データ:');
          console.log(oldData);
          console.log('新データ:');
          console.log(newData);
          console.log('新ドキュメントID:');
          console.log(newDocId);
        }
      }

      setMessageInfo({ message: 'データの移行が完了しました。', type: 'success' });
      // 移行後に必要であれば、リダイレクトなどの処理を追加できます
      // router.push('/admin');
    } catch (error) {
      console.error('データ移行中にエラーが発生しました:', error);
      setMessageInfo({ message: 'データ移行中にエラーが発生しました。', type: 'error' });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PublicPageデータの移行</h1>
      <button
        onClick={handleMigration}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        データを移行する
      </button>
    </div>
  );
} 