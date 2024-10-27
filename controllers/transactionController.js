// backend/controllers/transactionController.js
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const { createQRISPayment } = require("../utils/paymentHelper");

exports.purchaseProducts = async (req, res) => {
  try {
    const { items, paymentType, amountPaid, buyerName } = req.body;

    let totalProfit = 0;
    let totalCost = 0;
    let productDetails = [];

    for (const item of items) {
      const { productId, quantity } = item;
      const product = await Product.findById(productId);
      if (!product)
        return res
          .status(404)
          .json({ message: `Product with ID ${productId} not found` });
      if (product.stock < quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for product ${product.name}` });

      const profit = (product.salePrice - product.producerPrice) * quantity;
      totalProfit += profit;
      totalCost += product.salePrice * quantity;
      productDetails.push({ product: productId, quantity, profit });
      product.stock -= quantity;
      await product.save();
    }

    let transactionData = {
      products: productDetails,
      totalProfit,
      totalCost,
      paymentType,
    };

    switch (paymentType) {
      case "cash":
        if (amountPaid < totalCost) {
          return res
            .status(400)
            .json({ message: "Amount paid is insufficient for cash payment" });
        }
        transactionData.amountPaid = amountPaid;
        transactionData.change = amountPaid - totalCost;
        transactionData.paymentStatus = "completed";
        break;

      case "credit":
        transactionData.buyerName = buyerName;
        transactionData.debt = totalCost;
        break;

      case "qris":
        const qrisResponse = await createQRISPayment(totalCost);
        transactionData.qrisPaymentUrl = qrisResponse.qrisUrl;
        transactionData.paymentStatus = "pending";
        break;

      default:
        return res.status(400).json({ message: "Invalid payment type" });
    }

    const transaction = new Transaction(transactionData);
    await transaction.save();

    if (paymentType === "qris") {
      return res.status(201).json({
        message: "QRIS payment generated. Awaiting payment confirmation",
        qrisUrl: transaction.qrisPaymentUrl,
      });
    }

    res
      .status(201)
      .json({ message: "Transaction completed successfully", transaction });
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

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!["completed", "pending"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status for cash or credit" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.paymentType === "qris") {
      return res
        .status(400)
        .json({ message: "Use QRIS webhook for status updates" });
    }

    transaction.paymentStatus = status;
    if (status === "completed" && transaction.paymentType === "credit")
      transaction.debt = 0;

    await transaction.save();
    res.status(200).json({ message: "Status updated", transaction });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { paymentType, paymentStatus } = req.query;
    let filter = {};

    if (paymentType) filter.paymentType = paymentType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const transactions = await Transaction.find(filter).populate(
      "products.product"
    );
    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDebtors = async (req, res) => {
  try {
    const debtors = await Transaction.find({
      paymentType: "credit",
      debt: { $gt: 0 },
    })
      .select("buyerName debt")
      .populate("products.product");
    res.status(200).json({ debtors });
  } catch (error) {
    console.error("Error fetching debtors:", error);
    res.status(500).json({ message: "Server error" });
  }
};
