// backend\controllers\productController.js
const Product = require("../models/Product");

// Get all products with optional filters
exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      sortStock,
      minStock,
      maxStock,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    let query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Stock range filter
    if (minStock || maxStock) {
      query.stock = {};
      if (minStock) query.stock.$gte = parseInt(minStock);
      if (maxStock) query.stock.$lte = parseInt(maxStock);
    }

    // Create base query
    let productsQuery = Product.find(query).populate("category");

    // Apply sorting if specified
    if (sortStock === "asc") {
      productsQuery = productsQuery.sort({ stock: 1 });
    } else if (sortStock === "desc") {
      productsQuery = productsQuery.sort({ stock: -1 });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    productsQuery = productsQuery.skip(skip).limit(parseInt(limit));

    // Execute query
    const products = await productsQuery.exec();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      stock,
      minStock,
      producerPrice,
      salePrice,
      description,
      status,
      imageUrl,
      category,
    } = req.body;
    const newProduct = new Product({
      name,
      stock,
      minStock,
      producerPrice,
      salePrice,
      description,
      status,
      imageUrl,
      category,
    });
    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      stock,
      minStock,
      producerPrice,
      salePrice,
      description,
      status,
      imageUrl,
      category,
    } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        stock,
        minStock,
        producerPrice,
        salePrice,
        description,
        status,
        imageUrl,
        category,
      },
      { new: true, runValidators: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId })
      .populate("category")
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] },
    }).populate("category");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).populate("category");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};
