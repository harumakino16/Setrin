import { loadStripe } from '@stripe/stripe-js';

export const handleUpgradePlan = async (currentUser) => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

    const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            uid: currentUser.uid,
            returnUrl: window.location.href
        }),
    });

    const session = await response.json();

    await stripe.redirectToCheckout({ sessionId: session.id });
}; 