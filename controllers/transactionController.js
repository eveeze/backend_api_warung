// backend/controllers/transactionController.js
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");

exports.purchaseProducts = async (req, res) => {
  try {
    const { items } = req.body; // `items` adalah array produk dengan quantity-nya

    let totalProfit = 0;
    let productDetails = [];

    // Loop melalui setiap produk dalam transaksi
    for (const item of items) {
      const { productId, quantity } = item;

      // Cari produk berdasarkan ID
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with ID ${productId} not found` });
      }

      // Cek apakah stok cukup
      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for product ${product.name}` });
      }

      // Hitung keuntungan: harga jual - harga produsen
      const profit = (product.salePrice - product.producerPrice) * quantity;

      // Tambahkan ke total keuntungan
      totalProfit += profit;

      // Simpan detail produk dan kuantitas serta keuntungan per produk
      productDetails.push({
        product: productId,
        quantity,
        profit,
      });

      // Kurangi stok produk
      product.stock -= quantity;
      await product.save();
    }

    // Buat transaksi baru
    const transaction = new Transaction({
      products: productDetails,
      totalProfit,
    });
    await transaction.save();

    res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Hitung total untung hari ini
exports.getTodayProfit = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day

    // Ambil semua transaksi hari ini
    const transactions = await Transaction.find({
      date: { $gte: today },
    });

    // Akumulasi keuntungan harian dari setiap transaksi
    const totalProfit = transactions.reduce((acc, transaction) => {
      return acc + transaction.totalProfit;
    }, 0);

    res.status(200).json({ totalProfit });
  } catch (error) {
    console.error("Error fetching today's profit:", error);
    res.status(500).json({ message: "Server error" });
  }
};
