const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
  guildFullName: {
    type: String
  },
  guildShortName: {
    type: String
  },
  guildLeader: {
    type: String
  },
  guildScores: {
    type: Number,
    default: 0
  },
  guildLevel: {
    type: Number,
    default: 1
  },
  guildMembers: {
    type: []
  },
  guildDealsCommited: {
    type: []
  },
  guildSilver: {
    type: Number,
    default: 0
  },
  contractedVendors: {
    type: []
  },
  guildLeaderRemun:{
    type: Number,
    default: 0
  },
  guildPurchase: {
    type: []
  },
  guildPost: {
    type: String
  },
  guildLogo: {
    type: String
  },
  applicants: {
    type: []
  },
  perk: {
    type: Number,
    default: 0
  },
  allies:{
    type: [],
  },
  contributionRatio:{
    type: Number,
    default: 0.05
  },
  leaderBenefit:{
    type: Number,
    default: 0.18
  },
  currentMonthContribution:{
    type: [],
    default: []
  },
  previousMonthContribution:{
    type: [],
    default: []
  },
  isRulingGuild:{
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Guild", GuildSchema);
