import { buffer } from 'micro';
import { adminDB, FieldValue } from '@/lib/firebaseAdmin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2020-08-27' });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function webhookHandler(req, res) {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const dataObject = event.data.object;

  if (event.type === 'checkout.session.completed') {
    const uid = dataObject.metadata.uid;
    try {
      // ユーザーのプランを有料に更新
      await adminDB.collection('users').doc(uid).update({
        plan: 'premium',
        planUpdatedAt: FieldValue.serverTimestamp(),
      });
      console.log("User plan updated to premium:", uid);
    } catch (error) {
      console.error("Error updating user plan:", error.message);
    }
  } else if (event.type === 'customer.subscription.updated') {
    const uid = dataObject.metadata?.uid;
    if (uid) {
      try {
        const cancelAt = dataObject.cancel_at_period_end ? dataObject.cancel_at * 1000 : null;
        await adminDB.collection('users').doc(uid).update({
          cancelAt,
          planUpdatedAt: FieldValue.serverTimestamp(),
        });
        console.log("User subscription updated:", uid);
      } catch (error) {
        console.error("Error updating user subscription:", error.message);
      }
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const uid = dataObject.metadata?.uid;

    if (uid) {
      try {
        await adminDB.collection('users').doc(uid).update({
          plan: 'free',
          planUpdatedAt: FieldValue.serverTimestamp(),
        });
        console.log("User plan updated to free:", uid);
      } catch (error) {
        console.error("Error updating user plan:", error.message);
      }
    } else {
      console.error("UID not found in subscription metadata.");
    }
  }

  res.json({ received: true });
}
