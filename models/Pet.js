const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  petImage: {
    type: String,
    trim: true,
  },
  petImgUrl: {
    type: String,
    trim: true,
  },
  petPerformance: {
    type: String,
    trim: true,
  },
});

module.exports = mongoose.model("Pet", PetSchema);
