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
const path = require("path");
const bodyParser = require("body-parser");

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
// Multer Config (Image Upload)
// ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========================
// Health Check Route
// ========================
app.get("/", (req, res) => res.send("Server OK"));

// ========================
// MongoDB Connection
// ========================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
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
    const newItem = new Item({
      seller: req.body.seller,
      address: req.body.address,
      contact: req.body.contact,
      category: req.body.category,
      description: req.body.description,
      fields: req.body.fields ? JSON.parse(req.body.fields) : {},
      imageUrl: req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : ""
    });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    console.error("Error saving item:", err);
    res.status(500).json({ error: "Failed to save item. Check MongoDB connection." });
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
