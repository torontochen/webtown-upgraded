const mongoose = require("mongoose");

const GuildDealSchema = new mongoose.Schema({
  vendor: {
    type: String
  },
  vendorLogo: {
    type: String
  },
  vendorCategory: {
    type: [],
    default: []
  },
  guildDealType: {
    type: String
  },
  guildDealLevels: {
    type: []
  },
  dealNo: {
    type: String
  },
  dealFulfillmentRecords: {
    type: [],
    default: []
  },
  dealRedeemTerm: {
    type: String
  },
  specificItemList: {
    type: []
  },
  dateFrom: {
    type: Date
  },
  dateTo: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("GuildDeal", GuildDealSchema);
