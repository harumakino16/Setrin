import H1 from '@/components/ui/h1';
import Layout from '../layout';
import { useState } from 'react';
import withAdminAuth from '@/components/withAdminAuth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Test = () => {
    const [emailData, setEmailData] = useState({
        to: '',
        subject: 'テストメール',
        html: '<p>これはテストメールです。</p>'
    });

    const [bulkEmailData, setBulkEmailData] = useState({
        recipients: '',
        templateId: 'd-2169d7b1070b4ea996fba6eb90af60a7',
        templateData: {
            subject: 'バルクメールテスト',
            content: '<p>これは一斉送信のテストメールです。</p>'
        }
    });

    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('送信中...');

        try {
            const response = await fetch('/api/send-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('✅ メールが送信されました');
            } else {
                setStatus(`❌ エラー: ${data.message}`);
            }
        } catch (error) {
            setStatus(`❌ エラー: ${error.message}`);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        setStatus('一斉送信中...');

        try {
            // メールアドレスを配列に変換
            const recipients = bulkEmailData.recipients
                .split(/[,\n]/)
                .map(email => email.trim())
                .filter(email => email);

            const response = await fetch('/api/send-bulk-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipients,
                    templateId: bulkEmailData.templateId,
                    templateData: bulkEmailData.templateData
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus(`✅ ${data.sentCount}件のメールが送信されました`);
            } else {
                setStatus(`❌ エラー: ${data.message}`);
            }
        } catch (error) {
            setStatus(`❌ エラー: ${error.message}`);
        }
    };

    const handleChange = (e) => {
        setEmailData({
            ...emailData,
            [e.target.name]: e.target.value
        });
    };

    const handleBulkChange = (e) => {
        if (e.target.name === 'templateData.subject' || e.target.name === 'templateData.content') {
            const [parent, child] = e.target.name.split('.');
            setBulkEmailData({
                ...bulkEmailData,
                [parent]: {
                    ...bulkEmailData[parent],
                    [child]: e.target.value
                }
            });
        } else {
            setBulkEmailData({
                ...bulkEmailData,
                [e.target.name]: e.target.value
            });
        }
    };

    return (
        <Layout>
            <H1>テストページ</H1>
            <div className="max-w-2xl mx-auto mt-8 space-y-8">
                {/* 単一メール送信フォーム */}
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">テストメール送信</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
                                宛先メールアドレス
                            </label>
                            <input
                                type="email"
                                id="to"
                                name="to"
                                value={emailData.to}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                件名
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={emailData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="html" className="block text-sm font-medium text-gray-700 mb-1">
                                本文（HTML）
                            </label>
                            <textarea
                                id="html"
                                name="html"
                                value={emailData.html}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            送信
                        </button>
                    </form>
                </div>

                {/* バルクメール送信フォーム */}
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-6">一斉メール送信テスト</h2>
                    <form onSubmit={handleBulkSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-1">
                                宛先メールアドレス（カンマまたは改行で区切り）
                            </label>
                            <textarea
                                id="recipients"
                                name="recipients"
                                value={bulkEmailData.recipients}
                                onChange={handleBulkChange}
                                required
                                rows={4}
                                placeholder="example1@example.com,example2@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1">
                                テンプレートID
                            </label>
                            <input
                                type="text"
                                id="templateId"
                                name="templateId"
                                value={bulkEmailData.templateId}
                                onChange={handleBulkChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="templateData.subject" className="block text-sm font-medium text-gray-700 mb-1">
                                件名
                            </label>
                            <input
                                type="text"
                                id="templateData.subject"
                                name="templateData.subject"
                                value={bulkEmailData.templateData.subject}
                                onChange={handleBulkChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="templateData.content" className="block text-sm font-medium text-gray-700 mb-1">
                                本文（HTML）
                            </label>
                            <textarea
                                id="templateData.content"
                                name="templateData.content"
                                value={bulkEmailData.templateData.content}
                                onChange={handleBulkChange}
                                required
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            一斉送信
                        </button>
                    </form>
                </div>

                {status && (
                    <div className={`p-3 rounded ${status.includes('✅') ? 'bg-green-100' : 'bg-red-100'}`}>
                        {status}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default withAdminAuth(Test);

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}
    