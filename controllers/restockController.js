// controllers/restockController.js
const Product = require("../models/Product");
const Restock = require("../models/Restock");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.createRestock = async (req, res) => {
  try {
    // Step 1: Get all low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] },
    }).populate("category");

    if (!lowStockProducts.length) {
      return res.status(400).json({ message: "No low stock products found" });
    }

    // Step 2: Map low stock products and create restock data
    const restockData = lowStockProducts.map((product) => ({
      product: product._id,
      requestedStock: product.minStock * 2, // Example restock amount, you can customize this
      currentStock: product.stock,
    }));

    // Step 3: Create restock entry in database with status 'pending'
    const restock = new Restock({ products: restockData, status: "pending" });
    await restock.save();

    // Step 4: Generate PDF report
    const doc = new PDFDocument();
    const filePath = path.join(
      __dirname,
      `../reports/restock_report_${Date.now()}.pdf`
    );
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);
    doc.fontSize(20).text("Restock Report", { align: "center" });
    doc.moveDown();

    // Table Header
    doc
      .fontSize(12)
      .text("Product Name | Current Stock | Requested Stock | Category");
    doc.moveDown();

    // Fill table with restock data
    restock.products.forEach((item) => {
      const product = lowStockProducts.find((p) => p._id.equals(item.product));
      doc.text(
        `${product.name} | ${item.currentStock} | ${item.requestedStock} | ${product.category.name}`
      );
      doc.moveDown();
    });

    doc.end();

    writeStream.on("finish", () => {
      res.status(200).json({
        message: "Restock created and PDF generated",
        restockId: restock._id,
        pdfPath: filePath,
      });
    });
  } catch (error) {
    console.error("Error creating restock:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.completeRestock = async (req, res) => {
  try {
    const { restockId } = req.params;

    const restock = await Restock.findById(restockId).populate(
      "products.product"
    );
    if (!restock) {
      return res.status(404).json({ message: "Restock not found" });
    }

    if (restock.status !== "pending") {
      return res.status(400).json({ message: "Restock is not pending" });
    }

    // Update stok produk
    for (const item of restock.products) {
      const product = item.product;
      product.stock += item.requestedStock;
      await product.save();
    }

    // Ubah status restock menjadi completed
    restock.status = "completed";
    restock.updatedAt = Date.now();
    await restock.save();

    res.status(200).json({ message: "Restock completed", restock });
  } catch (error) {
    console.error("Error completing restock:", error);
    res.status(500).json({ message: "Server error" });
  }
};
