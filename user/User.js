const mongoose = require('mongoose');
 
const UserSchema = new mongoose.Schema({  
  name: String,
  email: String,
  password: String,
  premium: Boolean,
  premiumEnds: Date,
  createdAt: Date,
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');