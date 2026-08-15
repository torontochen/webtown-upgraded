const mongoose = require("mongoose")

const GameShopSubstituteSchema = new mongoose.Schema({

  vendor: {
    type: String,
    required: true,
    trim: true,
  },
 substituteItems: {
   type: [],
   default: []
 },
 dateFrom:{
   type:String
 },
 dateTo:{
   type:String
 },

})


module.exports = mongoose.model('GameShopSubstitute', GameShopSubstituteSchema)