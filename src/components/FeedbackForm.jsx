import React, { useState, useContext } from 'react';
import { db } from '@/../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';

const FeedbackForm = () => {
  const { currentUser } = useContext(AuthContext);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState(null);

  const MAX_CHARS = 1000;

  const handleChange = (e) => {
    const input = e.target.value;
    if (input.length <= MAX_CHARS) {
      setFeedback(input);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage(null);

    if (!feedback.trim()) {
      alert('フィードバック内容を入力してください。');
      setIsSubmitting(false);
      return;
    }

    if (!currentUser) {
      setSubmissionMessage({ type: 'error', text: 'ログインが必要です。' });
      setIsSubmitting(false);
      return;
    }

    try {
      const feedbackRef = collection(db, 'feedbacks');
      await addDoc(feedbackRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || '名前なし',
        content: feedback,
        createdAt: new Date(),
      });

      try {
        await fetch('/api/notify-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: currentUser.displayName || '名前なし',
            content: feedback,
          }),
        });
      } catch (emailError) {
        console.error('メール通知の送信に失敗:', emailError);
      }

      setFeedback('');
      setSubmissionMessage({ type: 'success', text: 'フィードバックありがとうございます。' });
    } catch (error) {
      console.error('フィードバック送信エラー:', error);
      setSubmissionMessage({ type: 'error', text: '送信に失敗しました。再度お試しください。' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmissionMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center text-gray-600">フィードバック送信フォーム</h1>
      <p className="text-sm text-gray-500 mb-4 text-center">
        バグ報告や機能提案など、ご意見をお寄せください。
        <br />
        ※このフォームからのご意見・ご提案に対する返信は行っておりません。
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
            フィードバック内容
          </label>
          <div className="relative">
            <textarea
              id="feedback"
              value={feedback}
              onChange={handleChange}
              rows="6"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="バグ報告・ご意見・ご提案はこちらにご記入ください。"
              required
            ></textarea>
            <div className={`text-sm mt-1 text-right ${
              feedback.length >= MAX_CHARS ? 'text-red-500' : 'text-gray-500'
            }`}>
              {feedback.length}/{MAX_CHARS}文字
            </div>
          </div>
        </div>
        <div>
          <button
            type="submit"
            className={`w-full flex justify-center items-center p-3 bg-customTheme-blue-primary text-white font-semibold rounded-md hover:bg-customTheme-blue-accent transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : null}
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </div>
      </form>
      {submissionMessage && (
        <div
          className={`mt-4 p-3 rounded-md text-white ${
            submissionMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {submissionMessage.text}
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;