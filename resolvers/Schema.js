const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//FlyerCoupon Sketch Schema
exports.SketchSchema = new Schema({
  sketchPages: {
    type: [],
    required: true,
  },
  sketchPages_C: {
    type: [],
  },
  flyerId: {
    type: String,
    required: true,
  },
  flyerTitle: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true
  },
  backgroundColor: {
    type: String,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  backgroundColor_C: {
    type: String,
    default: ''
  },
  width_C: {
    type: Number,
    default: 720
  },
  height_C: {
    type: Number,
    default: 230
  },
});

//SavedFlyerCoupon Schema
exports.FlyerSchema = new Schema({
  sketchPages: {
    type: [],
    required: true,
  },
  sketchPages_C: {
    type: [],
  },
  couponPages: {
    type: []
  },
  flyerPage_C: {
    type: []
  },
  flyerId: {
    type: String,
    required: true
  },
  flyerTitle: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  backgroundColor_C: {
    type: String,
    default: ''
  },
  width_C: {
    type: Number,
    default: 720
  },
  height_C: {
    type: Number,
    default: 230
  },
  dateFrom: {
    type: Date
  },
  dateTo: {
    type: Date
  },
  quantityDistributed: {
    type: Number,
    default: 0
  },
  vendor: {
    type: String
  },
  quantityRedeemed: {
    type: Number,
    default: 0
  },
  quantityRead: {
    type: Number,
    default: 0
  },
  salesGenerated: {
    type: Number,
    default: 0
  },
  couponValue: {
    type: []
  },
  totalPages: {
    type: Number
  },
  setUp: {
    type: Boolean,
    default: false
  },
  distributed: {
    type: Boolean,
    default: false
  },
  crossBoundary: {
    type: Boolean,
  },
  targetDistribute: {
    type: Boolean,
    default: false
  }
});

//FlyerCoupon Template Schema
exports.TemplateSchema = new Schema({
  templatePages: {
    type: [],
    required: true,
  },
  templatePages_C: {
    type: [],
  },
  templateId: {
    type: String,
    required: true,
  },
  templateTagName: {
    type: String,
    required: true,
  },
  templateType: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  backgroundColor_C: {
    type: String,
    default: ''
  },
  width_C: {
    type: Number,
    default: 720
  },
  height_C: {
    type: Number,
    default: 230
  },
});

// Item Catalog Schema
exports.ItemCatalogSchema = new Schema({
  subcategory: {
    type: String
  },
  itemCode: {
    type: String,
    index: true,
    unique: true
  },
  description: {
    type: String
  },
  specification: {
    type: String
  },
  unit: {
    type: String
  },
  photo: {
    type: String
  },
  rate: {
    type: Number
  },
  rewardSilver: {
    type: Number
  },
  promoRate: { 
    type: Number 
  },
  active: {
    type: Boolean
  },
  taxRate: {
    type: Number,
    default: 0.13
  },
  boundFlyers: {
    type: {}
  },
  event: {
    type: String,
    default: 'No'
  }
})

// Guild Deals Status
exports.GuildDealStatusSchema = new Schema({
  guildDealId: 
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GuildDeal"
  },
  dealNo:{
    type: String
  },
  vendor: {
    type: String
  },
  vendorLogo: {
    type: String
  },
  dateFrom: {
    type: Date
  },
  dateTo: {
    type: Date
  },
  guildDealType: {
    type: String
  },
  redeemTerm: {
    type: String
  },
  transactions: {
    type: []
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Vendor Promotion Status
exports.VendorPromotionEventSchema = new Schema({
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
  promotionItems: {
    type: []
  },
  dateFrom: {
    type: Date
  },
  dateTo: {
    type: Date
  },
  postOnPortal: {
    type: Boolean
  }
})

// Customer Rating 
exports.CustomerCommentSchema = new Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident'
  },
  rating: {
    type: Number,
    default: 0
  },
  comments: {
    type: String
  },
  // reply: {
  //   type: String
  // },
  time: {
    type: Date
  }
})

// Product Rating 
exports.ProductRatingSchema = new Schema({
  itemCode: {
    type: String,
    index: true
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  rating: {
    type: Number,
    default: 0
  },
  comments: {
    type: String
  },
  // reply: {
  //   type: String
  // },
  time: {
    type: Date
  }
})

// Shopping Cart
exports.ShoppingCartSchema = new Schema({
  itemCode: {
    type: String,
    unique: true
  }, 
  vendor: {
    type: mongoose.Schema.Types.ObjectId
  }, 
  description: {
    type: String
  }, 
  rewardSilver: {
    type: Number
  },
  quantity: {
    type: Number
  },
  rate: {
    type: Number,
    default: 0
  },
  promoRate: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  }
})

// vendor order
exports.VendorOrderSchema = Schema({
  date: {
    type: Date
  },
  orderNo: {
    type: String,
  },
  itemCode: {
    type: String
  },
  resident: {
    type: String
  },
  customerName: {
    type: String
  },
  vendor: {
    type: String
  },
  deliveryType: {
    type: String
  },
  description: {
    type: String
  },
  quantity: {
    type: Number
  },
  unitPrice: {
    type: Number
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  deliveryAddress: {
    type: String
  },
  pickupAddress: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  isUnderDispute: {
    type: Boolean,
    default: false
  },
  isCanceled: {
    type: Boolean,
    default: false
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  disputeInfo: {
    type: String
  },
  dealsTitle:{
    type: [],
    default: []
  },
  tax: {
    type: Number,
    default: 0
  },
  fulfillNote: {
    type: String,
    default: ''
  },
  isFulfilled: {
    type: Boolean,
    default: false
  }, 
  note: {
    type: String,
    default: ''
  }
})

// vendor settlement 
exports.VendorSettlementSchema = Schema({
  date: {
    type: Date
  },
  vendor:{
    type: String
  },
  salesOrderNo: {
    type: String
  },
  purchaseOrderNo: {
    type: String
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  boundaryGold: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String
  },
  boundaryPayable: {
    type: Number,
    default: 0
  },
  amountPaidByCustomer: {
    type: Number,
    default: 0
  },
  amountPaidToBoundary: {
    type: Number,
    default: 0
  }
})

// resident order
exports.ResidentOrderSchema = Schema({
  date: {
    type: Date,
  },
  orderNo: {
    type: String,
  },
  resident: {
    type: String
  },
  vendor: {
    type: String
  },
  deliveryType: {
    type: String
  },
  customerName: {
    type: String
  },
  totalAmount: {
    type: Number
  },
  totalDiscount: {
    type: Number
  },
  shipping: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number
  },
  deliveryAddress: {
    type: String
  },
  pickupAddress: {
    type: String
  },
  photo: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  orderItems: {
    type: [],
    default: []
  },
  dealsTitle: {
    type: [],
    default: []
  },
  isFood: {
    type: Boolean,
    default: true
  },
  totalRewardSilver: {
    type: Number,
    default: 0
  },
  silverSpand: {
    type: Number,
    default: 0
  },

  impending:{
    type: Boolean,
    default: false
  },
  finalizeInfo: {
    type: String,
    default: ''
  },
  isGameSubstitueBuy: {
    type: Boolean,
    default: false
  },
  isUnderDispute: {
    type: Boolean,
    default: false
  },
  isCanceled: {
    type: Boolean,
    default: false
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  disputeInfo: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  }
})

// guild chat
exports.GuildChatSchema = Schema({
  
  residentId: {
    type: mongoose.Schema.Types.ObjectId
  },
  message: {
    type: Object
  },
})

