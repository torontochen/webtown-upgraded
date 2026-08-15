const mongoose = require("mongoose")

const GameSubstituteItemSchema = new mongoose.Schema({

  itemCode: {
      type: String
  },
  itemName:{
      type: String
  },
  picture: {
      type: String
  }

})


module.exports = mongoose.model('GameSubstituteItem', GameSubstituteItemSchema)