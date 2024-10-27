// backend/controllers/reportController.js
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");

// GET /api/reports/sales - Laporan Penjualan
exports.getSalesReport = async (req, res) => {
  try {
    const { period = "daily" } = req.query; // Bisa daily, weekly, atau monthly
    let matchStage = {};
    const currentDate = new Date();

    if (period === "daily") {
      matchStage.date = { $gte: new Date(currentDate.setHours(0, 0, 0, 0)) };
    } else if (period === "weekly") {
      const startOfWeek = new Date(
        currentDate.setDate(currentDate.getDate() - currentDate.getDay())
      );
      startOfWeek.setHours(0, 0, 0, 0);
      matchStage.date = { $gte: startOfWeek };
    } else if (period === "monthly") {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      matchStage.date = { $gte: startOfMonth };
    }

    const salesReport = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalCost" },
          totalProfit: { $sum: "$totalProfit" },
        },
      },
    ]);

    res.status(200).json({
      period,
      totalSales: salesReport[0]?.totalSales || 0,
      totalProfit: salesReport[0]?.totalProfit || 0,
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/reports/stock - Laporan Stok Barang
exports.getStockReport = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] },
    }).populate("category");

    res.status(200).json({ lowStockProducts });
  } catch (error) {
    console.error("Error fetching stock report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/reports/debtors - Laporan Pelanggan yang Memiliki Hutang
exports.getDebtorsReport = async (req, res) => {
  try {
    const debtors = await Transaction.find({
      paymentType: "credit",
      debt: { $gt: 0 },
    })
      .select("buyerName debt products")
      .populate("products.product");

    res.status(200).json({ debtors });
  } catch (error) {
    console.error("Error fetching debtors report:", error);
    res.status(500).json({ message: "Server error" });
  }
};
