const Payment = require("../models/payment");
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Use dynamic key based on environment
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Same here
});
let id;

exports.createOrder = async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Razorpay accepts amount in paise
      currency: "INR",
      receipt: `receipt_${new Date().getTime()}`,
    });

    const payment = new Payment({
      orderId: order.id,
      amount,
      currency: "INR",
    });
    id = order.id;
    await payment.save();

    res.status(200).json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

exports.completePayment = async (req, res) => {
  const { paymentId } = req.body;
  await Payment.findOneAndUpdate(
    { orderId: id },
    { razorpayPaymentId: paymentId }
  );

  const payment = await Payment.findOne({ razorpayPaymentId: paymentId });

  if (payment) {
    res.status(200).json({ success: true });
  } else {
    // console.log(error);
    res.status(400).json({ error: "Payment not found" });
  }
};
