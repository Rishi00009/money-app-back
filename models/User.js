const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: ''
  },
  defaultBank: {
  type: String,
  default: 'Kotak Mahindra Bank'
},
  // ✅ ADD THIS FIELD
  cycleStartDay: {
    type: Number,
    default: 1,
    min: 1,
    max: 28
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);