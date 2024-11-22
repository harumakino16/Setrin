import Head from 'next/head';
import Link from 'next/link';
export default function LandingPage() {
  return (
      <div>
        <Head>
          <title>Setlink - あなたの音楽体験を次のレベルへ</title>
          <meta name="description" content="Setlinkは、音楽愛好家のための究極のツールです。" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header className="bg-blue-600 text-white py-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold">Setlink</h1>
            <nav>
              <Link href="#features" legacyBehavior><a className="mx-2">特徴</a></Link>
              <Link href="#problems" legacyBehavior><a className="mx-2">Vtuberの悩み</a></Link>
              <Link href="#testimonials" legacyBehavior><a className="mx-2">ユーザーの声</a></Link>
              <Link href="#faq" legacyBehavior><a className="mx-2">よくある質問</a></Link>
              <Link href="#contact" legacyBehavior><a className="mx-2">お問い合わせ</a></Link>
            </nav>
          </div>
        </header>

        <main>
          <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-center py-20">
            <div className="container mx-auto">
              <h2 className="text-5xl font-extrabold text-white mb-6">Setlink - あなたの音楽体験を次のレベルへ</h2>
              <p className="text-2xl text-gray-200 mb-10">お気に入りの曲を簡単に管理し、カスタムセットリストを作成し、YouTubeと連携してプレイリストをシームレスに共有できます。</p>
              <Link href="#start" legacyBehavior>
                <a className="bg-white text-blue-600 py-3 px-8 rounded-full shadow-lg hover:bg-gray-200 transition duration-300">今すぐ始める</a>
              </Link>
            </div>
          </section>

          <section id="features" className="container mx-auto py-20">
            <h2 className="text-3xl font-bold text-center mb-10">特徴</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-6 rounded shadow">
                <h3 className="text-2xl font-bold mb-4">簡単なセットリスト作成</h3>
                <p>直感的なインターフェースで、数クリックでカスタムセットリストを作成。曲の追加や削除も簡単に行えます。</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <h3 className="text-2xl font-bold mb-4">YouTube連携</h3>
                <p>YouTubeと連携して、作成したセットリストを簡単にプレイリストとして共有。さらに、YouTubeの再生リストをアプリに取り込むことも可能です。</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <h3 className="text-2xl font-bold mb-4">詳細な曲管理</h3>
                <p>曲の詳細情報を管理し、検索やフィルタリングも簡単に。曲名、アーティスト、ジャンル、タグなどで整理できます。</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <h3 className="text-2xl font-bold mb-4">ランダムセットリスト作成</h3>
                <p>指定した条件に基づいて、ランダムにセットリストを生成。新しい音楽体験を楽しむことができます。</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <h3 className="text-2xl font-bold mb-4">セキュリティ</h3>
                <p>ユーザー情報は安全に保護され、プライバシーも確保。安心してご利用いただけます。</p>
              </div>
            </div>
          </section>

          <section id="problems" className="bg-gray-100 py-20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10">Vtuberのよくある悩み</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="text-2xl font-bold mb-4">セットリストの管理が大変</h3>
                  <p>毎回の配信やイベントで異なるセットリストを作成するのは手間がかかります。Setlinkなら、簡単にセットリストを作成・管理できます。</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="text-2xl font-bold mb-4">YouTubeプレイリストの作成が面倒</h3>
                  <p>YouTubeでのプレイリスト作成は時間がかかります。Setlinkを使えば、アプリから直接YouTubeにプレイリストを作成できます。</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="text-2xl font-bold mb-4">曲の情報管理が煩雑</h3>
                  <p>曲の詳細情報を一元管理するのは難しいですが、Setlinkなら曲名、アーティスト、ジャンル、タグなどを簡単に管理できます。</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="text-2xl font-bold mb-4">新しい曲の発見が難しい</h3>
                  <p>ランダムセットリスト機能を使えば、新しい曲を簡単に発見し、リスナーに新鮮な音楽体験を提供できます。</p>
                </div>
              </div>
            </div>
          </section>

          <section id="testimonials" className="container mx-auto py-20">
            <h2 className="text-3xl font-bold text-center mb-10">ユーザーの声</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="bg-white p-6 rounded shadow">
                <p>"Setlinkのおかげで、ライブの準備が格段に楽になりました！" - 山田太郎</p>
              </div>
              <div className="bg-white p-6 rounded shadow">
                <p>"YouTubeとの連携機能が最高です。友達と簡単にプレイリストを共有できます。" - 佐藤花子</p>
              </div>
            </div>
          </section>

          <section id="faq" className="bg-gray-100 py-20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10">よくある質問</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="text-2xl font-bold mb-4">Q: Setlinkは無料ですか？</h3>
                  <p>A: はい、基本機能は無料でご利用いただけます。</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="text-2xl font-bold mb-4">Q: YouTubeとの連携はどのように行いますか？</h3>
                  <p>A: 設定ページから簡単に連携できます。詳細は<a href="#contact" className="text-blue-600">こちら</a>をご覧ください。</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="text-2xl font-bold mb-4">Q: セットリストはどのように作成しますか？</h3>
                  <p>A: 曲を選択し、「セットリストを作成」ボタンをクリックするだけです。</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                  <h3 className="text-2xl font-bold mb-4">Q: YouTubeの再生リストをアプリに取り込むことはできますか？</h3>
                  <p>A: はい、YouTubeの再生リストURLを入力するだけで、簡単にアプリに取り込むことができます。</p>
                </div>
              </div>
            </div>
          </section>

          <section id="start" className="container mx-auto py-20 text-center">
            <h2 className="text-3xl font-bold mb-10">今すぐ始める</h2>
            <p className="text-xl mb-8">Setlinkで音楽体験を次のレベルへ。今すぐ無料で始めましょう！</p>
            <Link href="#start" legacyBehavior><a className="bg-blue-600 text-white py-3 px-6 rounded">無料で始める</a></Link>
          </section>
        </main>

        <footer id="contact" className="bg-blue-600 text-white py-10">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Setlinkについて</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" legacyBehavior><a className="hover:underline">Setlinkとは</a></Link></li>
                  <li><Link href="/how-to-use" legacyBehavior><a className="hover:underline">使い方</a></Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">規約・ポリシー</h3>
                <ul className="space-y-2">
                  <li><Link href="/termsuser" legacyBehavior><a className="hover:underline">利用規約</a></Link></li>
                  <li><Link href="/privacypolicy" legacyBehavior><a className="hover:underline">プライバシーポリシー</a></Link></li>
                  <li><Link href="https://www.youtube.com/t/terms" legacyBehavior><a className="hover:underline">YouTubeの利用規約</a></Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">サポート</h3>
                <ul className="space-y-2">
                  <li><Link href="/contact" legacyBehavior><a className="hover:underline">お問い合わせ</a></Link></li>
                </ul>
              </div>
            </div>
            <div className="text-center pt-8 border-t border-blue-500">
              <p>© 2023 Setlink. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
  );
}