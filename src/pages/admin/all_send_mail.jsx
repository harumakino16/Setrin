import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig.js';
import H1 from '@/components/ui/h1';
import { Button } from '@/components/ui/button';
import LoadingIcon from '@/components/ui/loadingIcon';
import Layout from '@/pages/layout';
import { Dialog } from '@headlessui/react';

export default function AllSendMail() {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sendType, setSendType] = useState('test'); // test or bulk
    const [result, setResult] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const extractTitleFromContent = (htmlContent) => {
        const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
        return titleMatch ? titleMatch[1] : '';
    };

    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setContent(newContent);
        const extractedTitle = extractTitleFromContent(newContent);
        if (extractedTitle) {
            setSubject(extractedTitle);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResult('');

        try {
            const titleMatch = content.match(/<title>(.*?)<\/title>/);
            const extractedSubject = titleMatch ? titleMatch[1] : subject;
            const bodyContent = content.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || content;
            const cleanContent = bodyContent.replace(/<html[^>]*>|<\/html>|<head>[\s\S]*<\/head>|<body[^>]*>|<\/body>/gi, '').trim();

            let recipients = [];

            if (sendType === 'test') {
                recipients = ['harumakiafeli@gmail.com'];
            } else {
                const querySnapshot = await getDocs(collection(db, 'users'));
                recipients = querySnapshot.docs
                    .map(doc => doc.data().email)
                    .filter(email => email);
            }

            // チャンクサイズを小さくする
            const chunkSize = 100;
            const chunks = [];
            for (let i = 0; i < recipients.length; i += chunkSize) {
                chunks.push(recipients.slice(i, i + chunkSize));
            }

            let successCount = 0;
            let errorCount = 0;

            // チャンクごとに順次送信
            for (let i = 0; i < chunks.length; i++) {
                try {
                    const response = await fetch('/api/send-bulk-mail', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            recipients: chunks[i],
                            templateId: 'd-5934fea4d0af4b6699d5013b91f20662',
                            templateData: {
                                subject: extractedSubject,
                                content: cleanContent
                            }
                        })
                    });

                    // レスポンス処理を改善
                    const responseData = await response.text();
                    if (response.ok) {
                        successCount += chunks[i].length;
                    } else {
                        console.error('API error:', responseData);
                        errorCount += chunks[i].length;
                    }

                    // 進捗表示を更新
                    setResult(`送信中... ${successCount}件完了 (${errorCount}件エラー)`);

                    // APIレート制限対策の待機時間を増やす
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (error) {
                    console.error('Chunk error:', error);
                    errorCount += chunks[i].length;
                    // エラー時も待機
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            setResult(`送信完了: ${successCount}件送信成功、${errorCount}件送信失敗`);
        } catch (error) {
            console.error('Error:', error);
            setResult('エラーが発生しました: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreview = (e) => {
        e.preventDefault();
        setIsPreviewOpen(true);
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <H1>一斉メール送信</H1>

                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                    <div className="space-y-4">
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="test"
                                    checked={sendType === 'test'}
                                    onChange={(e) => setSendType(e.target.value)}
                                    className="mr-2"
                                />
                                テストメール送信
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="bulk"
                                    checked={sendType === 'bulk'}
                                    onChange={(e) => setSendType(e.target.value)}
                                    className="mr-2"
                                />
                                一括送信
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                件名（HTML内のtitleタグがある場合はそちらが優先されます）
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                本文 (HTML形式)
                            </label>
                            <textarea
                                value={content}
                                onChange={handleContentChange}
                                rows={10}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                        <Button
                            type="button"
                            onClick={handlePreview}
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            プレビュー
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? <LoadingIcon /> : '送信'}
                        </Button>
                    </div>

                    {result && (
                        <div className={`mt-4 p-4 rounded-md ${
                            result.includes('送信されました')
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                        }`}>
                            {result}
                        </div>
                    )}
                </form>

                {/* プレビューモーダル */}
                <Dialog
                    open={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    className="relative z-50"
                >
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title className="text-lg font-medium">
                                        メールプレビュー
                                    </Dialog.Title>
                                    <button
                                        onClick={() => setIsPreviewOpen(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <span className="sr-only">閉じる</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">件名:</h3>
                                    <p className="mt-1">
                                        {content.match(/<title>(.*?)<\/title>/)?.[1] || subject}
                                    </p>
                                </div>

                                <div className="border rounded-lg">
                                    <div className="bg-gray-50 p-4 rounded-t-lg border-b">
                                        <h3 className="text-sm font-medium text-gray-700">本文プレビュー:</h3>
                                    </div>
                                    <div 
                                        className="p-4 max-h-[60vh] overflow-auto"
                                        dangerouslySetInnerHTML={{ __html: content }}
                                    />
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </div>
        </Layout>
    );
}
