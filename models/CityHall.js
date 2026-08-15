const mongoose = require("mongoose");

const CityHallSchema = new mongoose.Schema({
 treasure:{
   type: Number,
   default: 0
 },
 population: {
   type: Number,
   default: 0
 },
 might: {
   type: Number,
   default: 0
 },
 metro: {
   type: String,
   default: 'Great Toronto'
 },
 governor: {
   type: String
 }
});

module.exports = mongoose.model("CityHall", CityHallSchema);
