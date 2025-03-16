export default function OtosapoAdBanner() {
    return (
        <div className="mt-8 mb-4 mx-auto max-w-4xl">
            <div className="bg-white border-2 border-[#ea580c] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* 期間限定バナー */}
                <div className="bg-[#ea580c] text-white text-center py-1.5 font-bold text-sm flex items-center justify-center">
                    <svg className="h-5 w-5 mr-1.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Vtuber・Vsinger限定キャンペーン！3/17～3/24まで</span>
                </div>

                <div className="flex flex-col md:flex-row items-center relative">
                    {/* メインコンテンツ部分（拡大） */}
                    <div className="w-full md:w-3/4 text-gray-800 p-5 md:pl-8">
                        <h3 className="font-bold text-[#ea580c] text-2xl md:text-3xl mb-2">
                            <span className="underline decoration-[#ea580c] decoration-2 underline-offset-2">歌枠の音質に悩むVtuberさん</span>へ
                        </h3>
                        <p className="text-sm md:text-base mb-3">
                            「音割れする」「ノイズが入る」「音量バランスが難しい」…<br />
                            <span className="font-semibold">そのお悩み、音の専門家が解決します！</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="inline-block bg-[#ea580c] text-white font-bold py-1 px-3 rounded-md text-sm">期間限定</span>
                            <span className="text-xs md:text-sm text-gray-700 font-semibold">3/17～3/24まで</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block bg-[#ea580c] text-white font-bold py-1 px-3 rounded-md text-sm">10% OFF</span>
                            <span className="text-xs md:text-sm text-gray-700 font-semibold">Setlinkユーザー専用コード: SETLINK10</span>
                        </div>
                    </div>

                    {/* 特徴リスト部分 */}
                    <div className="w-full md:w-1/3 bg-gray-50 p-4 md:pr-6 md:py-4 border-t md:border-t-0 md:border-l border-gray-100">
                        <div className="text-xs font-semibold text-[#ea580c] mb-2">歌枠に特化した音質調整</div>
                        <ul className="text-xs text-gray-700 space-y-1.5">
                            <li className="flex items-start">
                                <svg className="h-4 w-4 text-[#ea580c] mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>カラオケ音源との最適バランスを調整</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="h-4 w-4 text-[#ea580c] mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>高音での音割れを防止</span>
                            </li>
                            <li className="flex items-start">
                                <svg className="h-4 w-4 text-[#ea580c] mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>リスナーから「音質良くなったね！」との声多数</span>
                            </li>
                        </ul>
                        <a
                            href="https://otosapo.pxstudio.site/?utm_source=setlink&utm_medium=banner&utm_campaign=2025_0317"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-[#ea580c] hover:bg-[#f97316] text-white font-bold py-2 px-4 rounded-lg shadow transition-colors duration-200 text-center text-sm mt-3"
                        >
                            気になる！
                        </a>
                    </div>

                    {/* ロゴ部分（右下に小さく配置） */}
                </div>
                <div className="bg-gray-50 p-2 border-t border-gray-100">
                    <div className="flex justify-between items-center px-4">
                        <div className="flex flex-col xs:flex-row xs:items-center">
                            <span className="text-xs text-gray-500 mr-4">歌枠調整プラン: <span className="line-through">14,000円</span> → <span className="font-bold text-[#ea580c]">12,600円</span></span>
                            <span className="text-xs text-gray-500 mt-1 xs:mt-0">※期間限定価格</span>
                            <span className="text-xs text-gray-400">プロモーションコードはお支払い画面にてご入力ください</span>
                        </div>
                        <div className="bottom-2 right-2 md:bottom-3 md:right-3 z-10">
                            <img
                                src="/images/おとさぽ！ (1000 x 250 px).png"
                                alt="おとさぽ！"
                                className="h-8 md:h-10 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}