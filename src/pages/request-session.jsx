import { useEffect, useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import H1 from '@/components/ui/h1';

import Layout from '@/pages/layout';

function RequestSession() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { currentUser } = useContext(AuthContext); // 現在のユーザーを取得

  if (!currentUser) return;

  return (
    <Layout>
      <H1>リクエスト歌枠</H1>
    </Layout>
  );
}

export default RequestSession; 