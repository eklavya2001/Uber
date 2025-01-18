const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, default: "pending" },
  razorpayPaymentId: { type: String },
  currency: { type: String },
});

module.exports = mongoose.model("Payment", paymentSchema);
