const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const path = require("path");
require("dotenv").config();

const csvFilePath = path.join(
  __dirname,
  "..",
  "csv",
  "seeding_data_sembako1.csv"
);

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    const products = [];

    // Read and parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(
          csv({
            mapValues: ({ header, value }) => value.trim(), // Trim whitespace from values
          })
        )
        .on("data", (data) => {
          try {
            // Skip empty rows
            if (!data.name || !data.category) {
              return;
            }

            // Validate required fields
            if (!data.name.trim() || !data.category.trim()) {
              return;
            }

            // Transform the data
            const product = {
              name: data.name,
              stock: Number(data.stock) || 0,
              minStock: Number(data.minStock) || 0,
              producerPrice: Number(data.producerPrice) || 0,
              salePrice: Number(data.salePrice) || 0,
              description: data.description || "",
              status: data.status || "active",
              imageUrl: data.imageUrl || "",
              category: new mongoose.Types.ObjectId(data.category),
            };
            products.push(product);
            console.log(`Processed product: ${product.name}`);
          } catch (error) {
            console.error("Skipping invalid row:", {
              name: data.name,
              category: data.category,
            });
          }
        })
        .on("end", () => {
          console.log("\nCSV file successfully processed");
          resolve();
        })
        .on("error", (error) => {
          console.error("Error processing CSV:", error);
          reject(error);
        });
    });

    // Insert products
    if (products.length > 0) {
      await Product.insertMany(products);
      console.log(`Successfully seeded ${products.length} products`);
    } else {
      console.log("No valid products found in CSV file");
    }
  } catch (error) {
    console.error("Error seeding products:", error);
    console.error("Error details:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
};

// Run the seeder
seedProducts();
