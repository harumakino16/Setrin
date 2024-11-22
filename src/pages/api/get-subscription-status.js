import { adminDB } from '@/lib/firebaseAdmin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { uid } = req.body;

    try {
        const customer = await adminDB.collection('users').doc(uid).get();
        const stripeCustomerId = customer.data()?.stripeCustomerId;

        if (!stripeCustomerId) {
            throw new Error('お客様のStripe情報が見つかりません。');
        }

        const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: 'all',
            limit: 1,
        });

        if (!subscriptions.data || subscriptions.data.length === 0) {
            return res.status(200).json({ message: 'サブスクリプションが見つかりませんでした。' });
        }

        const subscription = subscriptions.data[0];

        let cancelAt = null;
        if (subscription.cancel_at_period_end && subscription.cancel_at) {
            cancelAt = subscription.cancel_at * 1000; // ミリ秒に変換
        }

        res.status(200).json({ cancelAt });

    } catch (error) {
        console.error("Error fetching subscription status:", error);
        res.status(500).json({ error: error.message || 'サブスクリプション情報の取得に失敗しました。' });
    }
}