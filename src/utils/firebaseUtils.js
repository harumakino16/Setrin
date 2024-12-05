import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const registerUserInFirestore = async (user) => {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        plan: 'free'
    }, { merge: true });
};