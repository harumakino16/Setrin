import { db } from '../../firebaseConfig';
import { collection, getDocs, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

export default async function updateSongDates(userId) {
  try {
    const response = await fetch('../api/updateSongDates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to update song dates');
    }
    const result = await response.json();
    console.log(result.message);
    return result;
  } catch (error) {
    console.error('曲のデータの更新に失敗しました。', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

// 使用例
// updateSongDates('ユーザーID');
