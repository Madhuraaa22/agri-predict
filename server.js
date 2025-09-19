// ========================
// Load Environment Variables
// ========================
require('dotenv').config();

// ========================
// Imports
// ========================
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ========================
// Models
// ========================
const Item = require("./models/Item");
const Order = require("./models/Order");

// ========================
// App Initialization
// ========================
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// ========================
// Cloudinary Config
// ========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ========================
// Multer + Cloudinary Storage Config
// ========================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });

// ========================
// Cloudinary Image Upload Route
// ========================
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }
    // Cloudinary returns the uploaded image URL in req.file.path
    res.status(200).json({
      message: "Image uploaded successfully!",
      imageUrl: req.file.path,
    });
  } catch (err) {
    console.error("Error uploading image to Cloudinary:", err);
    res.status(500).json({ error: "Image upload failed. Check server logs." });
  }
});

// ========================
// Health Check Route
// ========================
app.get("/", (req, res) => res.send("Server OK"));

// ========================
// MongoDB Connection
// ========================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// ========================
// Item Routes
// ========================
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ timestamp: -1 });
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items. Check MongoDB connection." });
  }
});

app.post("/items", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    const newItem = await Item.create({
      seller: req.body.seller,
      address: req.body.address,
      contact: req.body.contact,
      category: req.body.category,
      description: req.body.description,
      fields: req.body.fields ? JSON.parse(req.body.fields) : {},
      imageUrl: req.file.path, // Use the path from the uploaded file
    });
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error saving item:", err);
    res.status(500).json({ error: "Failed to save item. Check logs for details." });
  }
});

// ========================
// Order Routes
// ========================
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders. Check MongoDB connection." });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully!" });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ error: "Failed to place order. Check MongoDB connection." });
  }
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
