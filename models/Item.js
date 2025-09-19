const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
  seller: String,
  address: String,
  contact: String,
  category: String,
  description: String,
  fields: Object,
  imageUrl: String,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Item', ItemSchema);
