/**
 * Shared imports and helpers for the query domain modules.
 *
 * This is the header that used to sit above the single 60-resolver
 * `resolvers/Query.js`. Splitting the resolvers by domain (Phase 3b) moved it here so
 * each domain module can pull in what it needs.
 */
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const { tenantUri } = require("../tenantUri");
const { logger } = require("../logger");
// const path = require('path');
const fs = require('fs');
// const moment = require("moment");
var _ = require("lodash");
const {
  SketchSchema,
  FlyerSchema,
  TemplateSchema,
  ItemCatalogSchema,
  GuildDealStatusSchema,
  VendorPromotionEventSchema,
  CustomerCommentSchema,
  ShoppingCartSchema,
  VendorOrderSchema,
  ResidentOrderSchema,
  VendorSettlementSchema,
  GuildChatSchema,
  ProductRatingSchema 
} = require("../Schema");
const EventCat = require("../../models/EventCat");
const RewardItem = require("../../models/RewardItem");

module.exports = {
  CustomerCommentSchema,
  EventCat,
  FlyerSchema,
  GuildChatSchema,
  GuildDealStatusSchema,
  ItemCatalogSchema,
  ProductRatingSchema,
  ResidentOrderSchema,
  RewardItem,
  ShoppingCartSchema,
  SketchSchema,
  TemplateSchema,
  VendorOrderSchema,
  VendorPromotionEventSchema,
  VendorSettlementSchema,
  fs,
  logger,
  mongoose,
  puppeteer,
  tenantUri,
};
