import { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const { currentUser } = useContext(AuthContext);
    const [theme, setTheme] = useState('pink');

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
                if (doc.exists()) {
                    setTheme(doc.data().theme || 'pink');
                }
            });
            return () => unsubscribe();
        }
    }, [currentUser]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
