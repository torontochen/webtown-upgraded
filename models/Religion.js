const mongoose = require("mongoose")

const ReligionSchema = new mongoose.Schema({
  belief: {
    type: []
  }
})



module.exports = mongoose.model('Religion', ReligionSchema)