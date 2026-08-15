const mongoose = require("mongoose")

const GamePropSchema = new mongoose.Schema({

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


module.exports = mongoose.model('GameProp', GamePropSchema)