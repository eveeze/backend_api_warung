// /models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stock: { type: Number, required: true },
    minStock: { type: Number, required: true },
    producerPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    description: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    imageUrl: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
