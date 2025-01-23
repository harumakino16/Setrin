import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '@/context/AuthContext';

const PREMIUM_FEATURE_START_DATE = new Date('2025-02-01T00:00:00+09:00');

export default function PremiumCheck({ children }) {
    const router = useRouter();
    const { currentUser } = useAuthContext();
    const isPremiumUser = currentUser?.plan === 'premium';
    const isAfterFeatureStartDate = new Date() >= PREMIUM_FEATURE_START_DATE;

    useEffect(() => {
        if (isAfterFeatureStartDate && !isPremiumUser) {
            router.push('/utawakutool');
        }
    }, [isPremiumUser, isAfterFeatureStartDate, router]);

    if (isAfterFeatureStartDate && !isPremiumUser) {
        return null;
    }

    return children;
} 