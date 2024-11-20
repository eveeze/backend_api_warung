const mongoose = require("mongoose");

const restockSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      requestedStock: { type: Number, required: true },
      currentStock: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Restock", restockSchema);
