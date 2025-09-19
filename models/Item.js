const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  seller: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  fields: { type: Object, default: {} },
  imageUrl: { type: String, required: true },  // Save Cloudinary image URL here
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Item', ItemSchema);
