const mongoose = require("mongoose")

const Bizcat_RestaurantSchema = new mongoose.Schema({
  items: {
    type: [],
    required: true
  },
})



module.exports = mongoose.model('Bizcat_Restaurants', Bizcat_RestaurantSchema)