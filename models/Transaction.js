// backend/models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        profit: { type: Number, required: true },
      },
    ],
    totalProfit: { type: Number, required: true },
    totalCost: { type: Number, required: true }, // New field for the total transaction amount
    paymentType: {
      type: String,
      enum: ["cash", "credit", "qris"],
      required: true,
    },
    amountPaid: { type: Number }, // Cash payment
    change: { type: Number }, // Cash payment
    buyerName: { type: String }, // Credit
    debt: { type: Number }, // Credit
    qrisPaymentUrl: { type: String }, // QRIS payment link
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
