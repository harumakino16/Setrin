interface PublicPageSettings {
  enabled: boolean;
  pageId: string;
  displayName: string;
  description: string;
  visibleColumns: {
    title: boolean;
    artist: boolean;
    genre: boolean;
    tags: boolean;
    singingCount: boolean;
    skillLevel: boolean;
    youtube: boolean;
  };
}

interface User {
  // 既存のフィールド
  email: string;
  displayName: string;
  theme: string;
  youtubeRefreshToken?: string;
  
  // 新規追加
  publicPage: PublicPageSettings;

  // プラン情報を追加
  plan: 'free' | 'premium'; // ユーザーのプラン
  playlistCreationCount?: number; // 今月の再生リスト作成回数
  planUpdatedAt?: Date; // プランの最終更新日時
} 