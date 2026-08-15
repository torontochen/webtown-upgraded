const mongoose = require("mongoose")

const FoodSchema = new mongoose.Schema({
  food: {
    type: []
  }
})



module.exports = mongoose.model('FavoriteFood', FoodSchema)