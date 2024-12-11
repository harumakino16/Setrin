// pages/pubpagesetting/[id].jsx
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import Layout from '@/pages/layout';
import SearchForm from '@/components/SearchForm';
import PublicSongTable from '@/components/PublicSongTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEdit, faCheck, faTimes, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/context/ThemeContext';
import { useMessage } from '@/context/MessageContext';

export default function PubPageSettingDetail() {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const { setMessageInfo } = useMessage();

  const [searchCriteria, setSearchCriteria] = useState({
    freeKeyword: '',
    maxSung: 0,
    maxSungOption: '以下',
    tag: '',
    artist: '',
    genre: '',
    skillLevel: 0,
    skillLevelOption: '以下',
    memo: '',
    excludedTags: '',
    excludedGenres: ''
  });

  const [searchResults, setSearchResults] = useState([]);
  
  const [listInfo, setListInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // タイトル編集関連
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // searchCriteria が更新されたら検索を実行
  useEffect(() => {
    if (searchCriteria) {
      // 検索をトリガーするために、一時的にステートを更新
      setTriggerSearch(true);
    }
  }, [searchCriteria]);

  // 検索を実行するためのトリガー用ステート
  const [triggerSearch, setTriggerSearch] = useState(false);

  useEffect(() => {
    if (!currentUser || !id) return;
    const fetchPublicPageData = async () => {
      const publicPageRef = doc(db, 'users', currentUser.uid, 'publicPages', id);
      const publicPageDoc = await getDoc(publicPageRef);
      if (!publicPageDoc.exists()) {
        router.push('/404');
        return;
      }
      const data = publicPageDoc.data();
      setListInfo(data);

      // 「保存した検索条件」があればそれを適用
      if (data.savedSearchCriteria) {
        setSearchCriteria(data.savedSearchCriteria);
      } else if (data.searchCriteria) {
        setSearchCriteria(data.searchCriteria);
      }

      if (data.name) {
        setEditedTitle(data.name);
      } else {
        setEditedTitle('名称未設定...');
      }

      // visibleColumns をデータから設定
      if (data.visibleColumns) {
        setVisibleColumns(data.visibleColumns);
      }

      setLoading(false);
    };
    fetchPublicPageData();
  }, [currentUser, id, router]);

  // 検索結果を受け取りプレビュー用にstateを更新
  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    // 検索が完了したらトリガーをリセット
    setTriggerSearch(false);
  }, []);

  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    artist: true,
    genre: true,
    youtubeUrl: true,
    tags: true,
    singingCount: true,
    skillLevel: true
  });

  // カラム表示設定のハンドラー
  const toggleColumn = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleSave = async () => {
    if (!currentUser || !id) return;
    try {
      // 現在のsearchCriteriaをsavedSearchCriteriaとしても保存
      // これにより次回ロード時にはこの条件���デフォルトとして適用される
      const publicPageRef = doc(db, 'users', currentUser.uid, 'publicPages', id);
      await setDoc(publicPageRef, {
        name: editedTitle,
        searchCriteria: searchCriteria,
        savedSearchCriteria: searchCriteria,
        visibleColumns: visibleColumns
      }, { merge: true });

      const topLevelPublicPageRef = doc(db, 'publicPages', id);
      await setDoc(topLevelPublicPageRef, {
        userId: currentUser.uid,
        name: editedTitle || '名称未設定...',
        updatedAt: new Date()
      }, { merge: true });

      setMessageInfo({ type: 'success', message: '公開ページを更新しました' });
    } catch (error) {
      console.error('Error saving public page:', error);
      setMessageInfo({ type: 'error', message: '保存に失敗しました' });
    }
  };

  const publicURL = typeof window !== 'undefined' 
    ? `${window.location.origin}/public/${id}` 
    : '';

  const handleCopyURL = async () => {
    if (!publicURL) return;
    try {
      await navigator.clipboard.writeText(publicURL);
      setMessageInfo({
        type: 'success',
        message: 'URLをコピーしました'
      });
    } catch (error) {
      console.error('Failed to copy: ', error);
      setMessageInfo({ type: 'error', message: 'URLのコピーに失敗���ました' });
    }
  };

  const startEditingTitle = () => {
    setIsEditingTitle(true);
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    if (listInfo?.name) {
      setEditedTitle(listInfo.name);
    } else {
      setEditedTitle('名称未設定...');
    }
  };

  const confirmEditingTitle = async () => {
    setIsEditingTitle(false);
    const newListInfo = { ...listInfo, name: editedTitle };
    setListInfo(newListInfo);
    await handleSave();
  };

  // カラム名の日本語ラベルと順序を固定
  const columnOrder = [
    { key: 'title', label: '曲名' },
    { key: 'artist', label: 'アーティスト' },
    { key: 'genre', label: 'ジャンル' },
    { key: 'youtubeUrl', label: 'YouTubeリンク' },
    { key: 'tags', label: 'タグ' },
    { key: 'singingCount', label: '歌唱回数' },
    { key: 'skillLevel', label: '熟練度' }
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="p-8 space-y-6 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isEditingTitle ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmEditingTitle();
                  }}
                  className="border p-2 rounded text-gray-700 focus:outline-none focus:border-blue-500"
                  placeholder="タイトルを入力"
                />
                <button 
                  onClick={confirmEditingTitle}
                  className="text-green-600 hover:text-green-800"
                  title="タイトルを確定"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button 
                  onClick={cancelEditingTitle}
                  className="text-red-600 hover:text-red-800"
                  title="編集をキャンセル"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">
                  {editedTitle || '名称未設定...'}
                </h2>
                <button 
                  onClick={startEditingTitle}
                  className="text-gray-500 hover:text-gray-700"
                  title="タイトルを編集"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </>
            )}
          </div>
          <button
            onClick={handleSave}
            className={`bg-customTheme-${theme}-primary text-white px-4 py-2 rounded hover:bg-customTheme-${theme}-accent transition-colors`}
          >
            公開ページを保存
          </button>
        </div>

        {/* 公開URLセクション */}
        <div className="bg-gray-50 p-4 rounded shadow-sm space-y-2">
          <p className="font-semibold">公開ページURL:</p>
          <p className="text-sm text-gray-600">
            下記のURLをリスナーと共有すると、誰でもこの公開ページを見ることができます。
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={publicURL}
              readOnly
              className="border p-2 rounded w-full text-gray-700"
            />
            <button 
              onClick={handleCopyURL} 
              className="px-4 py-2 bg-gray-100 rounded-r-md border border-l-0"
              title="URLをコピー"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        </div>

        {/* 絞り込みフォーム */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-xl font-bold mb-4">公開する曲を絞り込む</h3>
          <p className="text-sm text-gray-600 mb-4">
            下記の検索フォームで公開時に表示する曲の条件を設定します。  
            前回保存した検索条件があれば、それが初期値として自動的に適用されています。
          </p>
          <SearchForm
            currentUser={currentUser}
            handleSearchResults={handleSearchResults}
            searchCriteria={searchCriteria}
            setSearchCriteria={setSearchCriteria}
            isRandomSetlist={false}
            triggerSearch={triggerSearch}
          />
        </div>

        {/* テーブル表示とカラム表示設定 */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-xl font-bold mb-4">現在の条件で表示される曲(プレビュー)</h3>
          <p className="text-sm text-gray-600 mb-4">
            以下は現在の条件でフィルタリングした曲の一覧です。このページを保存すると、リスナーがアクセスした際にこの条件に合う最新の曲が表示されます。
          </p>

          {/* カラム表示設定 */}
          <div className="flex flex-wrap gap-4 mb-4">
            {columnOrder.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleColumn(key)}
                className={`flex text-xs items-center px-4 py-2 rounded ${
                  visibleColumns[key] ? `bg-customTheme-${theme}-primary text-white` : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FontAwesomeIcon icon={visibleColumns[key] ? faEye : faEyeSlash} className="mr-2" />
                {label}
              </button>
            ))}
          </div>

          <PublicSongTable
            songs={searchResults}
            visibleColumns={visibleColumns}
          />
        </div>
      </div>
    </Layout>
  );
}
