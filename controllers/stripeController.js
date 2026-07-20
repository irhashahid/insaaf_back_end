const stripe = require("../config/stripe");
const { getDB } = require("../config/db");

// POST /create-payment-intent
// body: ( appointment_id, amount )
// call by Fltr when user slctts Stripe payment
async function createPaymentIntent(req, res) {
  try {
    const { appointment_id, amount } = req.body;

    if (!appointment_id || !amount)
      return res.status(400).json({ error: "appointment_id and amount are required" });

    // amount must be in smallest currency unit
    // for USD: $10.00 = 1000 cents
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",           // PKR not supported by Stripe
      metadata: {
        appointment_id: String(appointment_id),
        user_id: String(req.user.id),
      },
    });

    res.status(201).json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /confirm-payment
// body: (appointment_id, payment_intent_id)
// called by Fltr aftr Stripe cnfrms paymnt on client side
async function confirmPayment(req, res) {
  try {
    const { appointment_id, payment_intent_id } = req.body;

    if (!appointment_id || !payment_intent_id)
      return res.status(400).json({ error: "appointment_id and payment_intent_id are required" });

    // verify payment status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== "succeeded")
      return res.status(400).json({ error: "Payment not completed" });

    // update appointment payment_mode and payment_status in DB
    const db = getDB();
    await db.execute(
      "UPDATE appointments SET payment_mode = 'Stripe', payment_status = 1 WHERE id = ? AND client_id = ?",
      [appointment_id, req.user.id]
    );

    res.json({ message: "Payment confirmed successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


module.exports = { createPaymentIntent, confirmPayment };