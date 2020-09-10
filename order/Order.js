const mongoose = require('mongoose');
 
const OrderSchema = new mongoose.Schema({  
  userId: String,
  status: String,
  type: String,
  amount: Number,
  createdAt: Date,
});
mongoose.model('Order', OrderSchema);

module.exports = mongoose.model('Order');