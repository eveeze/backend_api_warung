// backend/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stock: { type: Number, required: true },
    producerPrice: { type: Number, required: true }, // Harga produsen
    salePrice: { type: Number, required: true }, // Harga jual
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
