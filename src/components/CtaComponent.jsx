// components/StartRequestModeCTA.jsx

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';

export default function ctaComponent({ 
  title,
  description,
  buttonText,
  buttonLink,
  ctaId // 各CTAの一意のID（例: "request-mode-cta"）
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const loadUserPreference = async () => {
      if (!currentUser) return;
      
      const userPrefsRef = doc(db, 'users', currentUser.uid);
      try {
        const docSnap = await getDoc(userPrefsRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (!data.ctaVisited || data.ctaVisited[ctaId] === true) {
            setIsVisible(true);
          }
        }

      } catch (error) {
        console.error('Error loading CTA preferences:', error);
      }
    };

    loadUserPreference();
  }, [currentUser, ctaId]);

  const ctaChange = async () => {
    const userPrefsRef = doc(db, 'users', currentUser.uid);
      try {
        await setDoc(userPrefsRef, {
          ctaVisited: {
            [ctaId]: false
          }
        }, { merge: true });
      } catch (error) {
        console.error('Error saving CTA preference:', error);
      }
    
  }

  const handleClose = async () => {
    setIsVisible(false);
    
    if (dontShowAgain && currentUser) {
      await ctaChange();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg flex flex-col items-center space-y-4 relative">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="閉じる"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <h4 className="text-lg font-bold text-blue-700">{title}</h4>
      <p className="text-gray-700 text-center text-sm whitespace-pre-wrap">
        {description}
      </p>
      <Link href={buttonLink} legacyBehavior>
        <button onClick={handleClose} className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded shadow hover:bg-blue-700 transition-colors">
          {buttonText}
        </button>
      </Link>

      {currentUser && (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="dontShowAgain" className="text-sm text-gray-600">
            次回から表示しない
          </label>
        </div>
      )}
    </div>
  );
}
