const mongoose = require("mongoose");

const MonsterChestSchema = new mongoose.Schema({
  vendor: {
    type: String
  },
  promotionItemTitle:{
    type: String,
    required: true,
  },
  promotionItemId:{
    type: String,
    required: true,
  },
  promotionType:{
    type: String,
  },
  rewardItems: {
    type: [],
  }
});

module.exports = mongoose.model("MonsterChest", MonsterChestSchema);
