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
            status: 'active',
            limit: 1,
        });

        // トライアル中のサブスクリプションも取得
        if (!subscriptions.data || subscriptions.data.length === 0) {
            const trialSubscriptions = await stripe.subscriptions.list({
                customer: stripeCustomerId,
                status: 'trialing',
                limit: 1,
            });

            if (!trialSubscriptions.data || trialSubscriptions.data.length === 0) {
                throw new Error('アクティブなサブスクリプションが見つかりません。');
            }

            subscriptions.data = trialSubscriptions.data;
        }

        const subscriptionId = subscriptions.data[0].id;

        // サブスクリプションを更新して、期間終了時にキャンセル
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        // キャンセル予定日時を取得
        const cancelAt = updatedSubscription.cancel_at * 1000; // ミリ秒に変換

        res.status(200).json({
            message: 'サブスクリプションが請求期間の終了時にキャンセルされます。',
            cancelAt,
        });

    } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ error: error.message || 'サブスクリプションのキャンセルに失敗しました。' });
    }
}