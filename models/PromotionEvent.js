const mongoose = require("mongoose")

const PromotionEventSchema = new mongoose.Schema({
  vendorId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  eventType: {
    type: String
  },
  eventPhoto: {
   type: String
  },
  eventTitle: {
    type: String
  },
  eventInstruction: {
    type: String
  },
  dateFrom: {
    type: Date
  },
  dateTo: {
    type: Date
  },
 
})

module.exports = mongoose.model("PromotionEvent", PromotionEventSchema)