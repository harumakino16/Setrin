'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Music, Youtube, List, Shuffle } from 'lucide-react'
import Image from 'next/image'
import { FREE_PLAN_MAX_SONGS, FREE_PLAN_MAX_YOUTUBE_PLAYLISTS, PREMIUM_PLAN_PRICE } from '@/constants'
import ContactForm from '@/components/ContactForm'
import Price from '@/components/Price'

function Feature({ number, imageSrc, title, description }) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-8">
      <div className="w-full md:w-1/3 flex justify-center items-center">
        <div className="">
          <Image src={imageSrc} alt={title} width={80} height={80} priority={true}/>
        </div>
      </div>
      <div className="w-full md:w-2/3 relative self-center">
        <span className="absolute -left-8 top-0 text-8xl font-bold text-[#E5F0FF] -z-10">{number}</span>
        <h3 className="text-xl font-bold mb-4 text-customTheme-blue-primary">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <head>
        <title>Setlink - Vtuberのセトリ管理ツール</title>
        <meta name="description" content="SetlinkはVtuber向けに特化した歌枠サポートツールです。自分が歌える曲を簡単に管理し、公開リストを通じてリスナーからのリクエスト受付もスムーズに実現できます。これまで手間だったセットリスト作成が楽になり、リクエスト歌枠がもっと楽しくなる、歌枠をメインに活動するVtuberに最適なアプリです。" />
        <meta name="keywords" content="Vtuber, セトリ, YouTube, 再生リスト, 管理ツール" />
        <meta property="og:title" content="Setlink - Vtuberのセトリ管理ツール" />
        <meta property="og:description" content="歌枠をもっと楽しく、もっと便利に" />
        <meta property="og:image" content="https://setlink.vercel.app/images/bunner.png" />
        <meta property="og:url" content="https://www.setlink.com/lp" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.setlink.com/lp" />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WQ6L8VVTH3"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-WQ6L8VVTH3');
          `}
        </script>
      </head>
      <div className="bg-blue-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/"><Image src="/images/SetLink_trance (1000 x 300 px).png" alt="Setlinkロゴ" width={150} height={30} priority={true} /></Link>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
            <nav className={`fixed top-0 right-0 h-full bg-white shadow-lg transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'} z-50 transition-transform duration-300 ease-in-out md:shadow-none md:static md:transform-none md:flex md:items-center md:space-x-6`}>
              <div className="flex justify-end p-4 md:hidden">
                <button onClick={closeMenu}>
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 p-4 md:p-0">
                <li><Link href="#features" className="text-gray-500 hover:text-customTheme-blue-primary" onClick={closeMenu}>特徴</Link></li>
                <li><Link href="#pricing" className="text-gray-500 hover:text-customTheme-blue-primary" onClick={closeMenu}>料金</Link></li>
                <li><Link href="#faq" className="text-gray-500 hover:text-customTheme-blue-primary" onClick={closeMenu}>FAQ</Link></li>
                <li><Link href="#contact" className="text-gray-500 hover:text-customTheme-blue-primary" onClick={closeMenu}>お問い合わせ</Link></li>
              </ul>
            </nav>
            <Link href="/" className="hidden md:block bg-customTheme-blue-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">今すぐ無料で始める</Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-customTheme-blue-primary">
              Vtuberのセトリを簡単管理
            </h1>
            <p className="text-xl mb-8 text-gray-500 max-w-2xl mx-auto">
              Setlinkは、セトリ作成からYouTubeの再生リスト自動作成まで、歌枠活動をスムーズにする全てを提供します。
            </p>
            <Link href="/" className="bg-customTheme-blue-primary text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors">
              今すぐ無料で始める
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white">
          <div className="max-w-4xl mx-auto px-4 py-12 relative">
            {/* Blue bars on left and right */}
            <div className="flex items-center justify-between mb-16">
              <div className="w-1 h-20 bg-customTheme-blue-primary"></div>
              <h2 className="text-3xl text-gray-600 font-bold text-center mx-4">3つの特徴</h2>
              <div className="w-1 h-20 bg-customTheme-blue-primary"></div>
            </div>
            <div className="space-y-12">

              <Feature
                number="1"
                imageSrc="/images/songlist_icon.svg"
                title="簡単なセト���作成"
                description="直感的なインターフェースで、数クリックでセトリを作成。曲の追加や削除も簡単に行えます。"
              />
              <Feature
                number="2"
                imageSrc="/images/youtube_icon.svg"
                title="YouTube連携"
                description="YouTubeと連携して、作成したセトリで再生リストを作成。さらに、YouTubeの再生リストからアプリに取り込むことも可能です。"
              />
              <Feature
                number="3"
                imageSrc="/images/management_icon.svg"
                title="詳細な曲管理"
                description="曲の詳細情報を管理し、検索やフィルタリングも簡単に。曲名、アーティスト、ジャンル、タグなどで整理できます。"
              />
            </div>

          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="">
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
                  answer: 'SetlinkアカウントとYouTubeアカウントを連携させるこで、簡単にプレイリストの共有や取り込みが可能になります。詳細な手順はヘルプセンターをご覧ください。',
                },
                {
                  question: 'セットリストの最大曲数は何曲ですか？',
                  answer: '無料プランでは1つのセットリストにつき最大50曲まで登録可能です。有料プランでは制限なく曲を追加できます。',
                },
                {
                  question: 'アプリのアップデート頻度はどのくらいですか？',
                  answer: '月に1-2回程度、新機能の追加やバグ修正のためのアップデートを行っています。大型アップデートについては事前にお知らせいたします。',
                },
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

        {/* Footer */}
        <footer className="bg-gray-100 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Setlink</h3>
                <p className="text-gray-500">Vtuber向けの歌枠管理ツール</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">リンク</h3>
                <ul className="space-y-2">
                  <li><Link href="/terms" className="text-gray-500 hover:text-customTheme-blue-primary">利用規約</Link></li>
                  <li><Link href="/privacypolicy" className="text-gray-500 hover:text-customTheme-blue-primary">プライバシーポリシー</Link></li>
                  <li><Link href="/tokusho" className="text-gray-500 hover:text-customTheme-blue-primary">特定商取引法に基づく表記</Link></li>
                  <li><Link href="/contact" className="text-gray-500 hover:text-customTheme-blue-primary">お問い合わせ</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">フォローする</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-500 hover:text-customTheme-blue-primary">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-500 hover:text-customTheme-blue-primary">
                    <span className="sr-only">YouTube</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-8 text-center">
              <p className="text-gray-500">&copy; 2023 Setlink. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

// PricingCard Component


