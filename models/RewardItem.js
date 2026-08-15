const mongoose = require("mongoose");

const RewardItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    // unique: true,
    trim: true,
  },
  icon:{
    type: String,
  }
});

module.exports = mongoose.model("RewardItem", RewardItemSchema);
