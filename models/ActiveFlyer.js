const mongoose = require("mongoose")

const ActiveFlyerSchema = new mongoose.Schema({

  businessTitle: {
    type: String,
    required: true,
    trim: true,
  },
  logo: {
    type: String
  },
  businessCategory: {
    type: String
  },
  vendorActiveFlyer: {
    type: []
  }

})


module.exports = mongoose.model('ActiveFlyer', ActiveFlyerSchema)