// pages/pubpagesetting/[id].jsx
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { db } from '@/../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Layout from '@/pages/layout';
import SearchForm from '@/components/SearchForm';
import PublicSongTable from '@/components/PublicSongTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faEdit, faCheck, faTimes, faEye, faEyeSlash, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@/context/ThemeContext';
import { useMessage } from '@/context/MessageContext';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

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

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const [triggerSearch, setTriggerSearch] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    artist: true,
    genre: true,
    youtubeUrl: true,
    tags: true,
    singingCount: true,
    skillLevel: true,
    memo: true
  });

  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(true);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

      if (data.visibleColumns) {
        setVisibleColumns(data.visibleColumns);
      }

      setDescription(data.description || '');
      setShowDescription(data.showDescription !== false);

      setLoading(false);
    };
    fetchPublicPageData();
  }, [currentUser, id, router]);

  useEffect(() => {
    if (searchCriteria) {
      setTriggerSearch(true);
    }
  }, [searchCriteria]);

  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    setTriggerSearch(false);
  }, []);

  const handleSearchCriteriaChange = (newCriteria) => {
    setSearchCriteria(newCriteria);
    setHasUnsavedChanges(true);
  };

  const toggleColumn = (column) => {
    setVisibleColumns(prev => {
      const newColumns = {
        ...prev,
        [column]: !prev[column]
      };
      setHasUnsavedChanges(true);
      return newColumns;
    });
  };

  const handleSave = async () => {
    if (!currentUser || !id) return;
    try {
      const publicPageRef = doc(db, 'users', currentUser.uid, 'publicPages', id);
      await setDoc(publicPageRef, {
        name: editedTitle,
        searchCriteria: searchCriteria,
        savedSearchCriteria: searchCriteria,
        visibleColumns: visibleColumns,
        description: description,
        showDescription: showDescription
      }, { merge: true });

      const topLevelPublicPageRef = doc(db, 'publicPages', id);
      await setDoc(topLevelPublicPageRef, {
        userId: currentUser.uid,
        name: editedTitle || '名称未設定...',
        updatedAt: new Date()
      }, { merge: true });

      setHasUnsavedChanges(false);
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
      setMessageInfo({ type: 'error', message: 'URLのコピーに失敗しました' });
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
    setHasUnsavedChanges(true);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setHasUnsavedChanges(true);
  };

  const toggleShowDescription = () => {
    setShowDescription(!showDescription);
    setHasUnsavedChanges(true);
  };

  const columnOrder = [
    { key: 'title', label: '曲名' },
    { key: 'artist', label: 'アーティスト' },
    { key: 'genre', label: 'ジャンル' },
    { key: 'youtubeUrl', label: 'YouTubeリンク' },
    { key: 'tags', label: 'タグ' },
    { key: 'singingCount', label: '歌唱回数' },
    { key: 'skillLevel', label: '熟練度' },
    { key: 'memo', label: '備考' }
  ];

  const handleBackToList = () => {
    router.push('/pubpagesetting');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="p-8 space-y-6 mx-auto">
        <button
          onClick={handleBackToList}
          className="flex items-center text-sm mb-4 hover:text-blue-600 transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="mr-2 text-sm item-center" />
          一覧に戻る
        </button>

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

        {/* 公開URL */}
        <div className="bg-gray-50 p-4 rounded shadow-sm space-y-2">
          <p className="font-semibold">公開ページURL</p>
          <p className="text-sm text-gray-600">
            下記のURLを共有すると、リスナーがの公開ページを見ることができます。
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
              className="px-4 py-2 bg-gray-100 rounded-r-md border border-l-0 hover:bg-gray-200 transition-colors"
              title="URLをコピー"
            >
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        </div>

        {/* 説明欄設定 - タイトル編集の下に追加 */}
        <div className="bg-white p-4 rounded shadow-sm space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">説明文</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">表示する</span>
              <button
                onClick={toggleShowDescription}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showDescription ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showDescription ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            公開ページに説明文を表示することができます。
          </p>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="リスナーに向けた説明文を入力してください"
            className="w-full h-32 p-2 border rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 絞り込みフォーム */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-xl font-bold mb-4">公開する曲を絞り込む</h3>
          <p className="text-sm text-gray-600 mb-4">
            下記フォームで公開条件を指定できます。保存後、リスナーはこの条件でフィルタされた曲のみを見ることができます。
          </p>
          <SearchForm
            currentUser={currentUser}
            handleSearchResults={handleSearchResults}
            searchCriteria={searchCriteria}
            setSearchCriteria={handleSearchCriteriaChange}
            isRandomSetlist={false}
            triggerSearch={triggerSearch}
          />
        </div>

        {/* プレビュー */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="text-xl font-bold mb-4">現在の条件で表示される曲(プレビュー)</h3>
          <p className="text-sm text-gray-600 mb-4">
            以下は設定条件下で表示される曲リストのプレビューです。
          </p>

          {/* カラム表示設定 */}
          <div className="flex flex-wrap gap-4 mb-4">
            {columnOrder.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleColumn(key)}
                className={`flex text-xs items-center px-4 py-2 rounded ${
                  visibleColumns[key] ? `bg-customTheme-${theme}-primary text-white` : 'bg-gray-200 text-gray-700'
                } hover:opacity-90 transition-opacity`}
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
      {hasUnsavedChanges && (
        <div className={`fixed bottom-0 left-0 right-0 bg-customTheme-${theme}-secondary p-4 shadow-lg border-t border-customTheme-${theme}-primary flex justify-between items-center`}>
          <div className={`text-customTheme-${theme}-primary`}>
            <span className="font-bold text-gray-700">未保存の変更があります。</span>
            <span className="ml-2 text-gray-700">変更を保存するには「公開ページを保存」ボタンを押してください。</span>
          </div>
          <button
            onClick={handleSave}
            className={`bg-customTheme-${theme}-primary text-white px-4 py-2 rounded hover:bg-customTheme-${theme}-accent transition-colors`}
          >
            公開ページを保存
          </button>
        </div>
      )}
    </Layout>
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