import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const fetchUsersSetlists = async (currentUser,setUsersSetlists) => {
    try {
        const setlistsRef = collection(db, 'users', currentUser.uid, 'Setlists');
        const snapshot = await getDocs(setlistsRef);
        if (snapshot.empty) {
            console.log('セットリストが見つかりません。');
        } else {
            const setlists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return setUsersSetlists(setlists);
        }
    } catch (error) {
        console.error('セットリストの取得中にエラーが発生しました:', error);
    }
};
export default fetchUsersSetlists;



