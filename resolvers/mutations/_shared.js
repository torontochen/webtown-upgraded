/**
 * Shared imports and helpers for the mutation domain modules.
 *
 * This is the header that used to sit above the single 59-resolver
 * `resolvers/Mutation.js`. Splitting the resolvers by domain (Phase 3b) moved it here so
 * each domain module can pull in what it needs.
 */
const mongoose = require("mongoose");
const { tenantUri } = require("../tenantUri");
const { logger } = require("../logger");
const conn = mongoose.connection;
// const _ = require("lodash");
// const { defaultConnection } = require("../../server");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const beautifyUnique = require('mongoose-beautiful-unique-validation')
const hbs = require("nodemailer-express-handlebars");
const inlineBase64 = require("nodemailer-plugin-inline-base64");
// var _ = require('lodash');

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
const { LOGO_BASE64 } = require("../../src/assets/constDataServer");
const sizeOf = require("object-sizeof");
const { cityhallUpdated } = require("../Subscription");
const { match } = require("assert");
// const { checkVendorEmail } = require("../Query");

// const { findOne } = require("../../models/Pet");

// Upload file dir
const DOWNLOAD_DIR = "./download";

// Create-token function

// Token lifetimes. `createToken*WithFP` previously called jwt.sign with no
// `expiresIn` at all, so tokens issued on the remembered-device path were valid
// forever — a leaked one could never age out. Both paths now expire; the
// remembered path just gets a longer window.
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "480h";
const TOKEN_EXPIRES_IN_REMEMBERED =
  process.env.TOKEN_EXPIRES_IN_REMEMBERED || "30d";

const createTokenWithFP = (resident, secret) => {
  const { residentName, email, _id } = resident;
  return jwt.sign(
    {
      id: String(_id),
      residentName,
      email,
      tokenSign: "resident",
    },
    secret,
    {
      expiresIn: TOKEN_EXPIRES_IN_REMEMBERED,
    }
  );
};



const createToken = (resident, secret, expiresIn) => {
  const { residentName, email, _id } = resident;
  return jwt.sign(
    {
      id: String(_id),
      residentName,
      email,
      tokenSign: "resident",
    },
    secret,
    {
      expiresIn,
    }
  );
};

const createVendorTokenWithFP = (vendor, secret) => {
  const { businessTitle, email, _id } = vendor;
  return jwt.sign(
    {
      id: String(_id),
      businessTitle,
      email,
      tokenSign: "vendor",
    },
    secret,
    {
      expiresIn: TOKEN_EXPIRES_IN_REMEMBERED,
    }
  );
};

const createVendorToken = (vendor, secret, expiresIn) => {
  const { businessTitle, email, _id } = vendor;
  return jwt.sign(
    {
      id: String(_id),
      businessTitle,
      email,
      tokenSign: "vendor",
    },
    secret,
    {
      expiresIn,
    }
  );
};

const formatAmount = (value) => {
  if(value==0) return "$0.00"
  return new Intl.NumberFormat('en-US', 
  { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 2, 
  minimumFractionDigits:2,
  // roundingIncrement: 5
  }).format(value)
}

const formatSilverAmount = (value) => {
  if(value==0) return "0"
  return new Intl.NumberFormat('en-US', 
  { 
  // style: 'currency', 
  // currency: 'USD', 
  // maximumFractionDigits: 2, 
  // minimumFractionDigits:2,
  // roundingIncrement: 5
  }).format(value)
}

module.exports = {
  CustomerCommentSchema,
  DOWNLOAD_DIR,
  FlyerSchema,
  GuildChatSchema,
  GuildDealStatusSchema,
  ItemCatalogSchema,
  LOGO_BASE64,
  ProductRatingSchema,
  ResidentOrderSchema,
  ShoppingCartSchema,
  SketchSchema,
  TOKEN_EXPIRES_IN,
  TOKEN_EXPIRES_IN_REMEMBERED,
  TemplateSchema,
  VendorOrderSchema,
  VendorPromotionEventSchema,
  VendorSettlementSchema,
  bcrypt,
  cityhallUpdated,
  conn,
  createToken,
  createTokenWithFP,
  createVendorToken,
  createVendorTokenWithFP,
  formatAmount,
  formatSilverAmount,
  fs,
  hbs,
  inlineBase64,
  jwt,
  logger,
  match,
  mongoose,
  path,
  sizeOf,
  tenantUri,
};
