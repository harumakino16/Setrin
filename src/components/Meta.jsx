import Head from 'next/head';

export default function Meta({ 
  title = 'Setlink - Vtuberのセトリ管理ツール',
  description = 'SetlinkはVtuber向けに特化した歌枠サポートツールです。自分が歌える曲を簡単に管理し、公開リストを通じてリスナーからのリクエスト受付もスムーズに実現できます。',
  ogDescription = '歌枠をもっと楽しく、もっと便利に',
  ogImage = 'https://setlink.vercel.app/images/bunner.png',
  ogUrl,
  children 
}) {
  return (
    <Head>
      {/* 基本的なメタタグ */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="Vtuber, 歌枠, セトリ, YouTube, 再生リスト, 管理ツール" />
      
      {/* OGP関連のメタタグ */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl || 'https://setlink.vercel.app'} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Setlink" />
      
      {/* その他の設定 */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={ogUrl || 'https://setlink.vercel.app'} />
      
      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-WQ6L8VVTH3"></script>
      <script dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WQ6L8VVTH3');
        `
      }} />
      
      {/* 追加のhead要素 */}
      {children}
    </Head>
  );
} 