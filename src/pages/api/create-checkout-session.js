import { adminDB } from '@/lib/firebaseAdmin';
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export default async function handler(req, res) {
  const { uid, returnUrl } = req.body;

  try {
    // FirestoreからユーザーのメールアドレスとStripe顧客IDを取得
    const userDoc = await adminDB.collection('users').doc(uid).get();
    const userData = userDoc.data();
    let stripeCustomerId = userData.stripeCustomerId;

    // 過去にトライアルを使用したユーザーはトライアルを開始できない
    if (userData.hasUsedTrial) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: stripeCustomerId,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            uid: uid,
          },
          // トライアル期間なし
        },
        success_url: `${returnUrl}?upgrade_success=true`,
        cancel_url: returnUrl,
        metadata: {
          uid: uid,
        },
      });
      res.status(200).json({ id: session.id });
      return;
    }

    // Stripe顧客IDが存在しない場合、新しい顧客を作成
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.displayName,
      });
      stripeCustomerId = customer.id;

      // FirestoreにStripe顧客IDを保存
      await adminDB.collection('users').doc(uid).update({
        stripeCustomerId: stripeCustomerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          uid: uid,
        },
        trial_period_days: 30, // 30日間のフリートライアル
      },
      success_url: `${returnUrl}?upgrade_success=true`,
      cancel_url: returnUrl,
      metadata: {
        uid: uid,
      },
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
