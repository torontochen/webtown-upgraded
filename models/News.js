const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
  newsTitle: {
    type: String,
    default: ''
  },
 headLine:{
   type: String,
   default: ''
 },
 date: {
   type: Date,
   default: Date.now()
 }
});

module.exports = mongoose.model("News", NewsSchema);
