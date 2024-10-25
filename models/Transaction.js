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
        quantity: { type: Number, required: true }, // Jumlah per produk
        profit: { type: Number, required: true }, // Keuntungan per produk
      },
    ],
    totalProfit: { type: Number, required: true }, // Keuntungan total untuk semua produk dalam transaksi
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
