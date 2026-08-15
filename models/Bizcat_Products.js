const mongoose = require("mongoose")

const Bizcat_ProductsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  items: {
    type: [],
    required: true
  },
})



module.exports = mongoose.model('Bizcat_Products', Bizcat_ProductsSchema)