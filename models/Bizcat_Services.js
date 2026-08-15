const mongoose = require("mongoose")

const Bizcat_ServicesSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  items: {
    type: [],
    required: true
  },
})



module.exports = mongoose.model('Bizcat_Services', Bizcat_ServicesSchema)