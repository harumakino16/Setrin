import React, { useState } from 'react';

const ContactForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // バリデーション
        if (!name || !email || !message) {
            alert('名前、メールアドレス、メッセージは必須です。');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('有効なメールアドレスを入力してください。');
            return;
        }

        setIsSubmitting(true);

        try {
            // バックエンドへの送信処理
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, subject, message }),
            });

            if (response.ok) {
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
                alert('お問い合わせありがとうございます。後ほど担当者よりご連絡いたします。');
            } else {
                alert('送信に失敗しました。再度お試しください。');
            }
        } catch (error) {
            console.error('送信エラー:', error);
            alert('送信中にエラーが発生しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-600">お問い合わせ</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">氏名、または活動名<span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: 山田 太郎"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス<span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: example@example.com"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">件名</label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="例: 機能に関する質問"
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">メッセージ<span className="text-red-500">*</span></label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="6"
                        className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="お問い合わせ内容をこちらにご記入ください。"
                        required
                    ></textarea>
                </div>

                <div>
                    <button
                        type="submit"
                        className={`w-full flex justify-center items-center p-3 bg-customTheme-blue-primary text-white font-semibold rounded-md hover:bg-customTheme-blue-accent transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                        ) : null}
                        {isSubmitting ? '送信中...' : '送信'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContactForm;
