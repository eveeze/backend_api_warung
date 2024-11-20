// /models/Transaction.js
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
    totalCost: { type: Number, required: true },
    paymentType: {
      type: String,
      enum: ["cash", "credit", "qris"],
      required: true,
    },
    amountPaid: { type: Number },
    change: { type: Number },
    buyerName: { type: String },
    debt: { type: Number },
    qrisImageUrl: { type: String },
    qrisPaymentUrl: { type: String },
    orderId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
