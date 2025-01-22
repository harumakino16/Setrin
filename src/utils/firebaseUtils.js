import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const registerUserInFirestore = async (userData) => {
    const { uid, email, displayName, signUpSource } = userData;

    try {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            email,
            displayName,
            signUpSource,
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