'use client'

import Link from 'next/link'
import { useState, useContext, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Music, Youtube, List, Shuffle, Users, Wand2, Shield, Lock, Settings } from 'lucide-react'
import Image from 'next/image'
import { FREE_PLAN_MAX_SONGS, FREE_PLAN_MAX_YOUTUBE_PLAYLISTS, PREMIUM_PLAN_PRICE } from '@/constants'
import ContactForm from '@/components/ContactForm'
import Price from '@/components/Price'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { AuthContext } from '@/context/AuthContext'
import Header from '@/components/header'
import Footer from '@/components/footer'

function FeatureCard({ icon: Icon, title, color, sections }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-50 group">
      <div className={`bg-gradient-to-r ${color} text-white p-4 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold mb-6" style={{ color: color }}>
        {title}
      </h3>
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-blue-50 p-4 rounded-xl">
            <h4 className="font-semibold mb-3 flex items-center text-blue-700">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {section.title}
            </h4>
            <ul className="space-y-3 text-gray-600">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useTranslation('common');
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const userCount = "2,400";
  const router = useRouter();

  // 現在の URL から utm パラメータを取得する
  const { utm_source, utm_medium, utm_campaign, utm_content } = router.query;

  // 取得した utm パラメータがあれば、ログインリンク用のクエリ文字列を生成
  const loginQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (utm_source) params.set('utm_source', utm_source);
    if (utm_medium) params.set('utm_medium', utm_medium);
    if (utm_campaign) params.set('utm_campaign', utm_campaign);
    if (utm_content) params.set('utm_content', utm_content);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }, [utm_source, utm_medium, utm_campaign]);

  const meta = {
    title: 'Setlink - Vtuberのセトリ管理ツール',
    description: 'SetlinkはVtuber向けに特化した歌枠サポートツールです。自分が歌える曲を簡単に管理し、公開リストを通じてリスナーからのリクエスト受付もスムーズに実現できます。これまで手間だったセットリスト作成が楽になり、リクエスト歌枠がもっと楽しくなる、歌枠をメインに活動するVtuberに最適なアプリです。',
    keywords: 'Vtuber, セトリ, YouTube, 再生リスト, 管理ツール',
    ogImage: 'https://setlink.jp/images/bunner.png',
    path: '/lp',
    isPublic: true
  };

  const closeMenu = () => setMenuOpen(false);

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (!currentUser) {
      // ログイン時にクエリ文字列を付与してリダイレクト
      window.location.href = `/login${loginQuery}`;
      return;
    }
    window.location.href = '/dashboard';
  };

  const features = [
    {
      icon: Music,
      title: "楽曲データベース",
      color: "from-blue-500 to-blue-600",
      sections: [
        {
          title: "曲情報管理",
          items: [
            "曲名（日本語・ふりがな）登録",
            "アーティスト情報管理",
            "ジャンル分類・タグ付け（最大5つ）",
            "YouTube URL連携",
            "オリジナルキー・歌唱キー設定"
          ]
        },
        {
          title: "練習・実績記録",
          items: [
            "熟練度レベル（5段階）",
            "歌唱回数を簡単にカウント",
            "練習メモ・備考機能"
          ]
        }
      ]
    },
    {
      icon: List,
      title: "セットリスト管理",
      color: "from-purple-500 to-purple-600",
      sections: [
        {
          title: "セトリ作成",
          items: [
            "条件指定でのランダムセトリ生成",
            "ドラッグ&ドロップで簡単編集",
            "テンプレートからの作成",
            "過去のセトリの複製・編集"
          ]
        },
        {
          title: "データ連携",
          items: [
            "作成したセトリからYouTubeプレイリスト自動作成",
            "既存プレイリストのインポート",
            "配信ソフトとの連携（準備中）"
          ]
        }
      ]
    },
    {
      icon: Wand2,
      title: "配信支援ツール",
      color: "from-green-500 to-green-600",
      sections: [
        {
          title: "リクエスト歌枠ツール",
          items: [
            "リクエスト管理システム",
            "リアルタイムリクエスト表示",
            "匿名でのリクエスト可能",
            "新規、常連のチェックが可能",
            "消化、未消化の状態表示"
          ]
        },
        {
          title: "選曲支援",
          items: [
            "ルーレット機能",
            "AIによる選曲提案（準備中）"
          ]
        }
      ]
    },
    {
      icon: Users,
      title: "リスナー向け機能",
      color: "from-pink-500 to-pink-600",
      sections: [
        {
          title: "公開ページ",
          items: [
            "高度な検索・フィルタリング",
            "リクエスト機能搭載",
            "スマホ対応のレスポンシブデザイン",
            "ジャンル別・タグ別表示",
            "カスタマイズ可能なデザイン"
          ]
        }
      ]
    }
  ];

  return (
    <>
      <Header meta={meta} />
      <div className="bg-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm fixed w-full top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <Image 
                src="/images/Setlink_trance_1000x300px.png" 
                alt="Setlinkロゴ" 
                width={150} 
                height={30} 
                priority={true} 
              />
            </Link>
            
            {/* モバイルメニューボタン */}
            <button 
              className="md:hidden z-50" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="メニュー"
            >
              {!menuOpen ? (
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
            </button>

            {/* モバイルナビゲーション */}
            <div className={`
              fixed inset-0 bg-white z-40 
              transform transition-transform duration-300 ease-in-out
              ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
              md:relative md:inset-auto md:transform-none md:translate-x-0 md:bg-transparent
              md:flex md:items-center
            `}>
              <nav className="h-full md:h-auto">
                <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 p-8 md:p-0">
                  <li>
                    <Link href="#features" className="text-gray-500 hover:text-customTheme-blue-primary block" onClick={closeMenu}>
                      特徴
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-gray-500 hover:text-customTheme-blue-primary block" onClick={closeMenu}>
                      料金
                    </Link>
                  </li>
                  <li>
                    <Link href="#faq" className="text-gray-500 hover:text-customTheme-blue-primary block" onClick={closeMenu}>
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="#contact" className="text-gray-500 hover:text-customTheme-blue-primary block" onClick={closeMenu}>
                      お問い合わせ
                    </Link>
                  </li>
                  <li className="md:hidden">
                    <Link 
                      href={`/login${loginQuery}`} 
                      className="bg-customTheme-blue-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors block text-center"
                      onClick={closeMenu}
                    >
                      {currentUser ? 'マイページへ' : '今すぐ無料で始める'}
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* デスクトップ用ログインボタン */}
            <Link 
              href={`/login${loginQuery}`}
              className="hidden md:block bg-customTheme-blue-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {currentUser ? 'マイページへ' : '今すぐ無料で始める・ログイン'}
            </Link>
          </div>
        </header>

        {/* ヘッダーの高さ分のスペーサー */}
        <div className="h-16"></div>

        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
          <div className="container mx-auto px-4 text-center relative">
            <div className="mb-8 animate-fade-in-up">
              <span className="bg-gradient-to-r from-customTheme-blue-primary to-blue-600 text-white px-8 py-4 rounded-full text-lg md:text-4xl font-semibold shadow-lg inline-block">
                VTuber・配信者のための歌枠総合支援ツール
              </span>
            </div>
            
            <div className="mb-12">
              <Image 
                src="/images/Setlink_trance_1000x300px.png" 
                alt="Setlinkロゴ" 
                width={300} 
                height={70} 
                priority={true}
                className="mx-auto w-full max-w-[300px]"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto">
              <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-customTheme-blue-primary to-blue-600 leading-tight">
                  歌枠を、<br />もっと楽しく。<br />もっと便利に。
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-600 leading-relaxed">
                  曲管理からリクエスト受付まで、<br />
                  歌枠配信に必要な全ての機能がここに。<br />
                  <span className="font-bold text-customTheme-blue-primary inline-block mt-2 text-xl md:text-2xl">
                    {FREE_PLAN_MAX_SONGS.toLocaleString()}曲まで無料！
                  </span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link 
                    href={`/login${loginQuery}`}
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-customTheme-blue-primary to-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {currentUser ? 'マイページへ' : '無料で始める'}
                  </Link>
                  <Link 
                    href="#features" 
                    className="bg-white text-customTheme-blue-primary border-2 border-customTheme-blue-primary px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-300"
                  >
                    機能を詳しく見る
                  </Link>
                </div>
              </div>

              <div className="md:w-1/2">
                <div className="relative px-4">
                  <Image
                    src="/images/dashboard-preview.png"
                    alt="Setlinkダッシュード"
                    width={600}
                    height={400}
                    className="rounded-lg shadow-2xl w-full"
                    priority={true}
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-gray-800">
                      すでに<span className="text-customTheme-blue-primary">{userCount}人</span>以上が利用中！
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 問題解決セクション */}
        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-8">
              <span className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xl font-semibold">
                Vtuberのよくある悩み
              </span>
            </div>
            <div className="text-center mb-12">
              {/* Vtuber画像を追加 */}
              <div className="relative w-48 h-48 mx-auto -mb-12">
                <Image
                  src="/images/vtuber-mascot1.png"
                  alt="Vtuberの悩みアイコン"
                  width={192}
                  height={192}
                  className="transform hover:scale-105 transition-transform duration-300"
                  priority={true}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-red-400 transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <Music className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-bold text-xl">曲管理の課題</h3>
                  </div>
                  <ul className="text-left text-gray-600 space-y-4">
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>歌える曲リストの管理が大変</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>キーやジャンルの整理が大変</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>新しく覚えた曲の追加が大変</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-green-600 mb-3">Setlinkの解決策</h4>
                    <ul className="text-left text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <span className="w-5 h-5 text-green-500 mr-2">✓</span>
                        <span>直感的な曲管理インターフェース</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 text-green-500 mr-2">✓</span>
                        <span>タグとカテゴリーで簡単整理</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-red-400 transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <Youtube className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-bold text-xl">配信準備の課題</h3>
                  </div>
                  <ul className="text-left text-gray-600 space-y-4">
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>セトリ作成に時間がかかる</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>YouTubeプレイリストの準備が面倒</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>リスナーに公開できる状態になってない</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-green-600 mb-3">Setlinkの解決策</h4>
                    <ul className="text-left text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <span className="w-5 h-5 text-green-500 mr-2">✓</span>
                        <span>ワンクリックでセトリ作成</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 text-green-500 mr-2">✓</span>
                        <span>プレイリスト自動生成機能</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-red-400 transform hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                      <Shuffle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="font-bold text-xl">配信中の課題</h3>
                  </div>
                  <ul className="text-left text-gray-600 space-y-4">
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>歌枠中のリクエストの管理が大変</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>知らない曲のリクエストがきてしまう</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-600">✕</span>
                      <span>いつもワンパターンの歌枠配信になってしまう</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-green-600 mb-3">Setlinkの解決策</h4>
                    <ul className="text-left text-gray-600 space-y-2">
                      <li className="flex items-center">
                        <span className="w-5 h-5 text-green-500 mr-2">✓</span>
                        <span>リアルタイムリクエスト管理</span>
                      </li>
                      <li className="flex items-center">
                        <span className="w-5 h-5 text-green-500 mr-2">✓</span>
                        <span>様々な歌枠ツールの提供</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="bg-gradient-to-r from-customTheme-blue-primary to-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                機能紹介
              </span>
              <h2 className="text-4xl font-bold mt-6 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-customTheme-blue-primary to-blue-600">
                充実の機能で歌枠配信をサポート
              </h2>
              {/* Vtuber画像を追加 */}
              <div className="relative w-48 h-48 mx-auto my-8">
                <Image
                  src="/images/vtuber-mascot2.png"
                  alt="笑顔のVtuberマスコット"
                  width={192}
                  height={192}
                  className="transform hover:scale-105 transition-transform duration-300 animate-bounce-slow"
                  priority={true}
                />
              </div>
              <p className="text-xl text-gray-600 mx-auto leading-relaxed">
                曲管理からリクエスト対応まで、歌枠配信に必要な全ての機能が揃っています。
                <span className="block mt-2 text-gray-600">
                  直感的な操作で、あなたの配信をより楽しく、より便利に。
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  color={feature.color}
                  sections={feature.sections}
                />
              ))}
            </div>
          </div>
        </section>

        {/* セキュリティ・プライバシーセクション */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                安心・安全
              </span>
              <h2 className="text-4xl font-bold mt-4 mb-8">セキュリティ・プライバシー</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-4xl text-customTheme-blue-primary mb-4">
                  <Shield className="mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">安全なログイン</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Google認証による安全なログイン</li>
                  <li>• 二要素認証対応</li>
                  <li>• セッション管理</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-4xl text-customTheme-blue-primary mb-4">
                  <Lock className="mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">データ保護</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• データの暗号化保存</li>
                  <li>• 定期的なバックアップ</li>
                  <li>• アクセス制御機能</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-4xl text-customTheme-blue-primary mb-4">
                  <Settings className="mx-auto" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">カスタマイズ</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• ライバー設定のカスタマイズ</li>
                  <li>• 公開範囲の詳細設定</li>
                  <li>• データ共有の制御</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 利用実績セクション */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-semibold">
                利用実績
              </span>
              <h2 className="text-4xl font-bold mt-4 mb-8">多くのVtuberに選ばれています</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="text-5xl font-bold text-customTheme-blue-primary mb-4">{userCount}人+</div>
                  <p className="text-gray-600">登録ユーザー数</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="text-5xl font-bold text-customTheme-blue-primary mb-4">130,000曲+</div>
                  <p className="text-gray-600">総登録曲数</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="text-5xl font-bold text-customTheme-blue-primary mb-4">1,000個+</div>
                  <p className="text-gray-600">作成されたセトリ数</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing">
          <Price />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl text-gray-600 font-bold mb-12 text-center">よくある質問</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                {
                  question: 'Setlinkは無料で使えますか？',
                  answer: 'Setlinkには無料プランと有料プランがあります。基本的な機能は無料でご利用いただけますが、より高度な機能や大容量のストレージをご希望の場合は有料プランをお選びください。',
                },
                {
                  question: 'YouTubeとの連携方法を教えてください。',
                  answer: 'SetlinkアカウントとYouTubeアカウントを連携させることで、簡単にプレイリストの共有や取り込みが可能になります。詳細な手順はヘルプセンターをご覧ください。',
                },
                {
                  question: 'セットリストの最大数は何曲ですか？',
                  answer: '無料プラン、有料プランともに制限なく曲を追加できます。',
                },
                {
                  question: 'アプリのアップデート頻度はどのくらいですか？',
                  answer: '月に1-2回程度、新機能の追加やバグ修正のためのアップデートを行っています。大型アップデートについては事前にお知らせいたします。',
                },
                {
                  question: 'データのバックアップは可能ですか？',
                  answer: 'はい。CSVファイルのエクスポートをしていただくことでバックアップが可能です。',
                },
                {
                  question: 'スマートフォンでも利用できますか？',
                  answer: 'はい、スマートフォンやタブレットなど、様々なデバイスに対応したレスポンシブデザインを採用しています。ブラウザさえあれば、どこからでもアクセス可能です。',
                },
                {
                  question: 'リスナーへの公開ページのカスタマイズは可能ですか？',
                  answer: 'はい、公開ページのデザインやレイアウト、表示する情報などを自由にカスタマイズできます。ヘッダー画像の設定(準備中)や、カラーテーマの変更なども可能です。',
                },
                {
                  question: '楽曲の著作権管理はどうなっていますか？',
                  answer: 'Setlinkは楽曲の管理ツールであり、著作権の許諾等は各ユーザー様の責任において行っていただく必要があります。著作権の取り扱いについては、各権利者様のガイドラインに従ってください。',
                },
                {
                  question: '解約や退会はいつでもできますか？',
                  answer: 'はい、いつでも解約・退会が可能です。有料プランの場合、契約期間の途中での解約でも、期間終了までサービスをご利用いただけます。',
                }
              ].map((faq, index) => (
                <details key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <summary className="font-semibold text-gray-600 cursor-pointer">{faq.question}</summary>
                  <p className="mt-2 text-gray-500">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-white">
          <ContactForm />
        </section>
      </div>
      <Footer />
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
