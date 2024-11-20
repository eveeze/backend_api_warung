// backend\controllers\productController.js
const Product = require("../models/Product");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
// Get all products with optional filters
exports.getAllProducts = async (req, res) => {
  try {
    const {
      ids,
      category,
      search,
      minStock,
      maxStock,
      minProducerPrice,
      maxProducerPrice,
      minSalePrice,
      maxSalePrice,
      status,
      sort = "stock:asc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    let query = {};

    // Filter by multiple IDs if provided
    if (ids) {
      const idArray = ids.split(",");
      query._id = { $in: idArray };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search by name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Stock range filter
    if (minStock || maxStock) {
      query.stock = {};
      if (minStock) query.stock.$gte = parseInt(minStock);
      if (maxStock) query.stock.$lte = parseInt(maxStock);
    }

    // Producer price range filter
    if (minProducerPrice || maxProducerPrice) {
      query.producerPrice = {};
      if (minProducerPrice)
        query.producerPrice.$gte = parseFloat(minProducerPrice);
      if (maxProducerPrice)
        query.producerPrice.$lte = parseFloat(maxProducerPrice);
    }

    // Sale price range filter
    if (minSalePrice || maxSalePrice) {
      query.salePrice = {};
      if (minSalePrice) query.salePrice.$gte = parseFloat(minSalePrice);
      if (maxSalePrice) query.salePrice.$lte = parseFloat(maxSalePrice);
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Base query with category population
    let productsQuery = Product.find(query).populate("category");

    // Multi-level sorting
    if (sort) {
      const sortCriteria = {};
      sort.split(",").forEach((field) => {
        const [key, order] = field.split(":");
        sortCriteria[key] = order === "desc" ? -1 : 1;
      });
      productsQuery = productsQuery.sort(sortCriteria);
    }

    // Pagination calculations
    const skip = (page - 1) * limit;
    productsQuery = productsQuery.skip(skip).limit(parseInt(limit));

    // Execute query and count total documents
    const [products, total] = await Promise.all([
      productsQuery.exec(),
      Product.countDocuments(query),
    ]);

    // Enhanced pagination metadata
    res.status(200).json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
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
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }).populate("category");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

