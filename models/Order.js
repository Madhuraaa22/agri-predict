const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  buyer: String,
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  quantity: Number,
  address: String
}, { timestamps: true });
module.exports = mongoose.model('Order', OrderSchema);
