// firebaseUtils.js
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const registerUserInFirestore = async (userData) => {
    // userData から新たに isAd も受け取るようにします
    const { uid, email, displayName, signUpSource, isAd, photoURL } = userData;

    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            email,
            displayName,
            signUpSource, // UTMパラメータやリファラーに基づく流入元情報
            isAd,         // 広告経由の場合は true、それ以外は false
            createdAt: serverTimestamp(),
            lastActivityAt: serverTimestamp(),
            plan: 'free',
            theme: 'blue',
        });
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};
