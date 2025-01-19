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
      // フリートライアル開始日とトライアル終了日を設定
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30); // 30日後

      await adminDB.collection('users').doc(uid).update({
        plan: 'premium',
        planUpdatedAt: FieldValue.serverTimestamp(),
        trialStartDate: FieldValue.serverTimestamp(),
        trialEndDate: trialEndDate,
        isTrialing: true,
      });
      console.log("User started trial period:", uid);
    } catch (error) {
      console.error("Error updating user plan:", error.message);
    }
  } else if (event.type === 'customer.subscription.updated') {
    const uid = dataObject.metadata?.uid;
    if (uid) {
      try {
        const updateData = {
          planUpdatedAt: FieldValue.serverTimestamp(),
          isTrialing: dataObject.status === 'trialing',
        };

        // トライアル状態の更新
        if (dataObject.status === 'trialing') {
          const trialEndDate = new Date(dataObject.trial_end * 1000);
          updateData.trialEndDate = trialEndDate;
        } else {
          updateData.trialEndDate = null;
          updateData.trialStartDate = null;
        }

        // キャンセルされている場合はキャンセル日を設定
        if (dataObject.cancel_at_period_end) {
          updateData.cancelAt = dataObject.cancel_at * 1000;
          updateData.nextPaymentAt = null;
        } else {
          // 継続中の場合は次回更新日を設定
          updateData.cancelAt = null;
          updateData.nextPaymentAt = dataObject.current_period_end * 1000;
        }
        
        await adminDB.collection('users').doc(uid).update(updateData);
        console.log("User subscription updated:", uid, updateData);
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
          isTrialing: false,
          trialEndDate: null,
          trialStartDate: null,
          hasUsedTrial: true,
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
