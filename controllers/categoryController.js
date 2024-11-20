// backend/controllers/categoryController.js
const Category = require("../models/Category");
const Product = require("../models/Product");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id });
    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "Tidak ada produk ditemukan pada category ini " });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("error fetching product berdasarkan kategori : ", error);
    res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};
exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res
      .status(201)
      .json({ message: "Category created", category: newCategory });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found" });
    res
      .status(200)
      .json({ message: "Category updated", category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error" });
  }
};
