const mongoose = require("mongoose");
const conn = mongoose.connection;
// const _ = require("lodash");
// const { defaultConnection } = require("../server");
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
} = require("./Schema");
const { LOGO_BASE64 } = require("../src/assets/constDataServer");
const sizeOf = require("object-sizeof");
const { cityhallUpdated } = require("./Subscription");
const { match } = require("assert");
// const { checkVendorEmail } = require("./Query");

// const { findOne } = require("../models/Pet");

// Upload file dir
const DOWNLOAD_DIR = "./download";

// Create-token function

const createTokenWithFP = (resident, secret) => {
  const { residentName, email } = resident;
  return jwt.sign(
    {
      residentName,
      email,
      tokenSign: "resident",
    },
    secret
  );
};



const createToken = (resident, secret, expiresIn) => {
  const { residentName, email } = resident;
  return jwt.sign(
    {
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
  const { businessTitle, email } = vendor;
  return jwt.sign(
    {
      businessTitle,
      email,
      tokenSign: "vendor",
    },
    secret
  );
};

const createVendorToken = (vendor, secret, expiresIn) => {
  const { businessTitle, email } = vendor;
  return jwt.sign(
    {
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

  allyGuild: async(_, {guildAsk, guildAccept}, {Guild}) => {
    await Guild.findOneAndUpdate({guildFullName: guildAsk}, { $push: { allies: { guildFullName: guildAccept, request: false }}})
    const guildAllied = await Guild.findOneAndUpdate({guildFullName: guildAccept}, { $push: { allies: {guildFullName: guildAsk, request: true }}})
    // console.log('guildAllied',guildAllied)
    return {
            guildFullName: guildAllied.guildFullName,
            guildShortName: guildAllied.guildShortName,
            guildScores: guildAllied.guildScores,
            guildLevel: guildAllied.guildLevel,
            guildMembers: guildAllied.guildMembers.length,
            guildPost: guildAllied.guildPost,
            guildLogo: guildAllied.guildLogo
          }
  },

  callGroupPurchase: async(_, {newsTitle, headLine, date}, {News, pubsub}) => {
   
    await new News({newsTitle, headLine, date}).save()
    pubsub.publish("NEWS_ADDED", {newsAdded: {newsTitle, headLine, date: Date.now().toString()}})
    return {newsTitle, headLine, date}
  },

  changePostalCode: async (
    _,
    { email, postalCode, initialLat, initialLng },
    { Resident }
  ) => {
    const resident = await Resident.findOneAndUpdate(
      // Find post by postId and createdBy
      {
        email,
      },
      {
        $set: {
          postalCode,
          initialLat,
          initialLng,
          location: { type: 'Point', coordinates: [initialLng , initialLat ] }
        },
      },
      {
        new: true,
      }
    );
    // console.log(resident.avatarPic)
    return {
      postalCode: resident.postalCode,
      initialLat: resident.initialLat,
      initialLng: resident.initialLng,
    };
  },

  // changeOrderStatus: async(_, { vendor, orderNo, status}, {pubsub}) => {
  //   const newVendor= vendor.replace(/\s/g, "")

  //   const MONGO_URI =
  //     process.env.MONGO_URI_PREFIX +
  //     newVendor +
  //     process.env.MONGO_URI_SUFFIX;

  //   const newConn = await mongoose.createConnection(MONGO_URI, {
  //     useNewUrlParser: true,
  //     useCreateIndex: true,
  //     useUnifiedTopology: true,
  //     useFindAndModify: false,
  //   });

  //   const modelVendorOrder = newVendor + "_" + "VendorOrder"
  //   const VendorOrder = newConn.model(modelVendorOrder, VendorOrderSchema)
  //   await VendorOrder.updateMany({orderNo}, {isFulfilled: status})
  //   const vendorOrderStatus = { vendor, orderNo, status}
  //   // console.log(vendorOrderStatus)
  //   pubsub.publish('ORDER_STATUS_CHANGED', {orderStatusChanged: vendorOrderStatus})
  //   return vendorOrderStatus
  // },

  commitGuildDeals: async (_, {input},{GuildDeal}) => {
    
    const { guildDealIds, guildFullName } = input
    const newGuildFullName = guildFullName.replace(/\s/g, "")
    // console.log(guildDealIds)
     const MONGO_URI =
        process.env.MONGO_URI_PREFIX +
        newGuildFullName  +
        process.env.MONGO_URI_SUFFIX;
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelName = newGuildFullName + "_" + "GuildDealsStatus";
      const GuildDealsStatus = newConn.model(modelName, GuildDealStatusSchema);

      for( let id of guildDealIds) {
        // console.log(id)
        // console.log(mongoose.mongo.ObjectId(id))
        const guildDeal =  await GuildDeal.findOneAndUpdate({_id : mongoose.mongo.ObjectId(id)}, 
        { $push: {dealFulfillmentRecords: { guild: guildFullName, purchaseAmount: 0}}}, {new : true})
        // console.log(guildDeal)
        const status = await new GuildDealsStatus({
          guildDealId: guildDeal._id,
          vendor: guildDeal.vendor,
          vendorLogo: guildDeal.vendorLogo,
          dateFrom: guildDeal.dateFrom,
          dateTo: guildDeal.dateTo,
          guildDealType: guildDeal.guildDealType,
          redeemTerm: guildDeal.dealRedeemTerm,
          dealNo: guildDeal.dealNo,
          transactions: []
        }).save()
        // console.log(status)
      }
      const guildDealStatus = await GuildDealsStatus.find({})
      const guildDealsStatusToReturn = guildDealStatus.map(async (item) => {

        const guildDeal = await GuildDeal.findOne({_id: item.guildDealId})

        return {
          specificItemList: guildDeal.specificItemList,
          guildDealLevels: guildDeal.guildDealLevels, 
          guildDealId: item.guildDealId,
          vendor: item.vendor,
          vendorLogo: item.vendorLogo,
          dateFrom: item.dateFrom,
          dateTo: item.dateTo,
          guildDealType: item.guildDealType,
          redeemTerm: item.redeemTerm,
          dealNo: item.dealNo,
          transactions: item.transactions
        }
      })
      // console.log(guildDealsStatusToReturn)
      return guildDealsStatusToReturn

  },

  createPromotionEvent: async (_, {input}  , { PromotionEvent, Vendor, News, pubsub }) => {
    const {
      vendor,
      vendorName,
      eventType,
      eventPhoto,
      eventTitle,
      eventInstruction,
      promotionItems,
      dateFrom,
      dateTo,
      postOnPortal
    } = input
    // console.log(dateFrom)
    // console.log(dateTo)
    const newsTitle = `(${vendorName}) ${eventType}: `
    const headLine = `${eventTitle}   From: ${dateFrom} To: ${dateTo}`
    // console.log(headLine)
    await new News({newsTitle, headLine, date: Date.now()}).save()
    pubsub.publish("NEWS_ADDED", {newsAdded: {newsTitle, headLine, date: Date.now().toString()}})

    const newVendorName = vendorName.replace(/\s/g, "")

      const MONGO_URI =
        process.env.MONGO_URI_PREFIX +
        newVendorName +
        process.env.MONGO_URI_SUFFIX;

      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelNameEvent = newVendorName + "_" + "PromotionEvent";
      const VendorPromotionEvent = newConn.model(modelNameEvent, VendorPromotionEventSchema);

     
    await new VendorPromotionEvent({vendorId: vendor,
                                      eventType,
                                      eventPhoto,
                                      eventTitle,
                                      eventInstruction,
                                      promotionItems,
                                      dateFrom,
                                      dateTo,
                                      postOnPortal}).save()
  
    await new PromotionEvent({vendorId: vendor,
                              eventType,
                              eventPhoto,
                              eventTitle,
                              eventInstruction,
                              dateFrom,
                              dateTo,
                              }).save()

   const eventList  = await PromotionEvent.find({}).populate({path: 'vendorId', model: Vendor}) 

   const modelName = newVendorName + "_" + "ItemCatalog";
   const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);

   for ( let item of promotionItems) {
     // console.log(item)
       await ItemCatalog.findOneAndUpdate(
                       {itemCode: item},
                       {$set: {
                         event: 'Yes'
                       }});
    }

     const promotionEvents = eventList.map(event => {
       return {
        vendor: event.vendorId.businessTitle,
        vendorUnitNo: event.vendorId.businessUnitNo,
        vendorStreetNo: event.vendorId.businessStreetNo,
        vendorStreetName: event.vendorId.businessStreetName,
        vendorCity: event.vendorId.businessCity,
        vendorState: event.vendorId.businessState,
        vendorCountry: event.vendorId.businessCountry,
        vendorPhone: event.vendorId.businessPhone[0],
        vendorEmail: event.vendorId.businessEmail,
        vendorRating: event.vendorId.rating,
        vendorCategory: event.vendorId.businessCategory,
        vendorLogo: event.vendorId.logo,
        eventType: event.eventType,
        eventPhoto: event.eventPhoto,
        eventTitle: event.eventTitle,
        eventInstruction: event.eventInstruction,
        dateFrom: event.dateFrom,
        dateTo: event.dateTo,
        eventId: event._id.toString(),
        lat: event.vendorId.lat,
        lng: event.vendorId.lng
       }
     })
    // console.log(promotionEvents)

        return promotionEvents
  },
  
  disally: async(_, {guildAsk, guildAccept}, {Guild}) => {
    // console.log('guildAsk', guildAsk)
    // console.log('guildAccept', guildAccept)

    await Guild.findOneAndUpdate({guildFullName: guildAsk}, 
      {$pull: { allies: {guildFullName: guildAccept}}})
    const guildDisallied = await Guild.findOneAndUpdate({guildFullName: guildAccept}, 
      {$pull: { allies: {guildFullName: guildAsk}}})
      // console.log('guildDisallied', guildDisallied)
      return {
        guildFullName: guildDisallied.guildFullName,
        guildShortName: guildDisallied.guildShortName,
        guildScores: guildDisallied.guildScores,
        guildLevel: guildDisallied.guildLevel,
        guildMembers: guildDisallied.guildMembers.length,
        guildPost: guildDisallied.guildPost,
        guildLogo: guildDisallied.guildLogo
      }
  },

  cancel: async(_, {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}, {pubsub}) => {
      // resident connection                     
      const revisedResident= resident.replace(/\s/g, "")
      //  console.log('revisedresident', revisedResident)
       const  newResident = revisedResident.replace(/\./g, "")
      //  console.log('newResident', newResident)
      
      const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
       newResident +
      process.env.MONGO_URI_SUFFIX;
  
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelResidentOrder = newResident + "_" + "ResidentOrder"
      const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)
  
      // vendor connection
  
      const newVendor= vendor.replace(/\s/g, "")
  
      const MONGO_URI_Vendor =
      process.env.MONGO_URI_PREFIX +
       newVendor +
      process.env.MONGO_URI_SUFFIX;
  
      const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelVendorOrder = newVendor + "_" + "VendorOrder";
      const VendorOrder = newConnVendor.model(modelVendorOrder,  VendorOrderSchema);

      await ResidentOrder.findOneAndUpdate({ orderNo }, { $set: { isCanceled }})
      await VendorOrder.findOneAndUpdate({ orderNo }, { $set: { isCanceled }})
      pubsub.publish("ORDER_STATUS_CHANGED", {orderStatusChanged : {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}})
      return { vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}
  },

  confirm: async(_, {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}, {pubsub}) => {
      // resident connection                     
      const revisedResident= resident.replace(/\s/g, "")
      //  console.log('revisedresident', revisedResident)
       const  newResident = revisedResident.replace(/\./g, "")
      //  console.log('newResident', newResident)
      
      const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
       newResident +
      process.env.MONGO_URI_SUFFIX;
  
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelResidentOrder = newResident + "_" + "ResidentOrder"
      const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)
  
      // vendor connection
  
      const newVendor= vendor.replace(/\s/g, "")
  
      const MONGO_URI_Vendor =
      process.env.MONGO_URI_PREFIX +
       newVendor +
      process.env.MONGO_URI_SUFFIX;
  
      const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelVendorOrder = newVendor + "_" + "VendorOrder";
      const VendorOrder = newConnVendor.model(modelVendorOrder,  VendorOrderSchema);

      await ResidentOrder.findOneAndUpdate({ orderNo }, { $set: { isConfirmed }})
      await VendorOrder.findOneAndUpdate({ orderNo }, { $set: { isConfirmed }})
      pubsub.publish("ORDER_STATUS_CHANGED", {orderStatusChanged : {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}})
      return { vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}
  },

  crackEgg: async(_, {resident, silver}, {Resident}) => {
    await Resident.findOneAndUpdate({ residentName: resident}, { $inc: { silverCoins: silver}})
    return { silver }
  },

  dispute: async(_, {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}, {pubsub}) => {
      // resident connection                     
      const revisedResident= resident.replace(/\s/g, "")
      //  console.log('revisedresident', revisedResident)
       const  newResident = revisedResident.replace(/\./g, "")
      //  console.log('newResident', newResident)
      
      const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
       newResident +
      process.env.MONGO_URI_SUFFIX;
  
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelResidentOrder = newResident + "_" + "ResidentOrder"
      const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)
  
      // vendor connection
  
      const newVendor= vendor.replace(/\s/g, "")
  
      const MONGO_URI_Vendor =
      process.env.MONGO_URI_PREFIX +
       newVendor +
      process.env.MONGO_URI_SUFFIX;
  
      const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelVendorOrder = newVendor + "_" + "VendorOrder";
      const VendorOrder = newConnVendor.model(modelVendorOrder,  VendorOrderSchema);

      await ResidentOrder.findOneAndUpdate({ orderNo }, { $set: { isUnderDispute: isUnderDispute, disputeInfo: content}})
      await VendorOrder.findOneAndUpdate({ orderNo }, { $set: { isUnderDispute: isUnderDispute, disputeInfo: content}})
      pubsub.publish("ORDER_STATUS_CHANGED", {orderStatusChanged : {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}})
      return { vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}
  },

  distributeFlyer: async (_, { input }, { ActiveFlyer, pubsub }) => {
    const {
      businessTitle,
      logo,
      businessCategory,
      flyerId,
      flyerTitle,
      flyerType,
      dateFrom,
      dateTo,
      crossBoundary,
      quantityDistributed
    } = input;
    // console.log('dateFrom', dateFrom)
    // console.log(Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
       vendor +
      process.env.MONGO_URI_SUFFIX;
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const pastSavedFlyer = await SavedFlyer.findOne({
      flyerId,
    });
    // console.log(pastSavedFlyer);
    if (pastSavedFlyer) {
      await SavedFlyer.findOneAndUpdate(
        {
          flyerId,
        },
        {
          distributed: true,
          crossBoundary,
          quantityDistributed
        },
        {
          new: true,
        }
      );
      const { couponValue } = pastSavedFlyer;
      let promoInfo = " ";
      if (couponValue.length > 0) {
        let cash = "Cash Discount";
        let per = "Percentage Discount";
        couponValue.map((item) => {
          if (item.valueType == "PERCENTAGE_DISCOUNT") {
            per = per + " " + item.amount * 100 + "%";
          } else {
            cash = item.valueType + " " + `$${item.amount}`;
          }
        });
        if (per.length > 19 && cash.length > 13) {
          promoInfo = per + " " + cash;
        } else {
          promoInfo = per.length > 19 ? per : cash;
        }


        // console.log(promoInfo)

        if (couponValue) {
          const modelName = vendor + "_" + "ItemCatalog";
          const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
          for(let singleCoupon of couponValue) {
            // console.log('singleCoupon itemsBound', singleCoupon)
            if(singleCoupon.itemsBound) {
              for(let item of singleCoupon.itemsBound) {
                await ItemCatalog.findOneAndUpdate({itemCode: item.itemCode}, 
                // { $push: { boundFlyers: {flyerId, couponId: singleCoupon.couponId}}, $set: { event: 'Yes'}})
                { $set: { event: 'Yes', boundFlyers: {flyerId, couponId: singleCoupon.couponId}}})
                }
            } else if (singleCoupon.valueType == 'PERCENTAGE_DISCOUNT' && singleCoupon.isForAllItems) {
              await ItemCatalog.updateMany({},{ $set: { boundFlyers: {flyerId, couponId: singleCoupon.couponId}}})
            }
            
          }
        }
      }
      const newFlyer = {
        flyerId,
        flyerTitle,
        flyerType,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        promoInfo: flyerType === "FLYER" ? " " : promoInfo,
        crossBoundary,
        targetDistribute: false
      };

      const vendorInActive = await ActiveFlyer.findOne({
        businessTitle,
      });

      if (vendorInActive) {
        await ActiveFlyer.findOneAndUpdate(
          {
            businessTitle,
          },
          {
            $push: {
              vendorActiveFlyer: newFlyer,
            },
          }
        );
      } else {
        await new ActiveFlyer({
          businessTitle,
          businessCategory,
          logo,
          vendorActiveFlyer: newFlyer,
        }).save();
      }

      const activeFlyers = await ActiveFlyer.find({})

       pubsub.publish("UPDATE_ACTIVE_FLYERS", { 
        updateActiveFlyers: activeFlyers,
      });


      

      const addedFlyer = {
        businessTitle,
        businessCategory,
        flyerId,
        flyerTitle,
        flyerType,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        promoInfo,
        crossBoundary,
        targetDistribute: false
      };

      // Broadcast the subscription
      pubsub.publish("FLYER_ADDED", {
        flyerAdded: addedFlyer,
      });
      return addedFlyer;
    } else {
      throw new Error("This flyer does not exist!");
    }
  },

  distributeWelfare: async (_, {welfare, total, metro}, {CityHall, Resident}) => {
    await CityHall.findOneAndUpdate({metro}, { $inc: {treasure: -total}})
    await Resident.updateMany({}, { $inc: {silverCoins: welfare}})
    return { distributed: true}
  },

  editGuild: async (_, { guildId,
    guildFullName,
    guildShortName,
    guildLogo,
    guildPost,
    perk,
    contributionRatio}, { Guild, Resident }) => {
   //update a new guild
    const guild = await Guild.findOneAndUpdate({_id: guildId}, { $set: {
      guildFullName,
      guildShortName,
      guildLogo,
      guildPost,
      perk,
      contributionRatio}}, {new: true})
   

  
    return {guildFullName: guild.guildFullName,
      guildShortName: guild.guildShortName,
      guildLogo: guild.guildLogo,
      guildPost: guild.guildPost,
      perk: guild.perk,
      contributionRatio: guild.contributionRatio}
  },

  gainLoseSilver: async(_, { winner, loser, amount }, {Resident}) => {
    // console.log("gainlose amount" + amount)
    // console.log("gainlose winner" + winner)
    // console.log("gainlose loser" + loser)
    await Resident.findOneAndUpdate({residentName: winner}, { $inc: { silverCoins: amount}})
    await Resident.findOneAndUpdate({residentName: loser}, { $inc: { silverCoins: -amount}})
    return { amount }
  },

  targetDistribute: async (_, { input }, { Resident, pubsub }) => {
    const {
      residentList,
      businessTitle,
      logo,
      businessCategory,
      flyerId,
      flyerTitle,
      flyerType,
      dateFrom,
      dateTo,
      crossBoundary,
      quantityDistributed
    } = input;
    // console.log(Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
       vendor +
      process.env.MONGO_URI_SUFFIX;
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const pastSavedFlyer = await SavedFlyer.findOne({
      flyerId,
    });
    // console.log(pastSavedFlyer);
    if (pastSavedFlyer) {
      await SavedFlyer.findOneAndUpdate(
        {
          flyerId,
        },
        {
          distributed: true,
          targetDistribute: true,
          crossBoundary,
          quantityDistributed
        },
        {
          new: true,
        }
      );
      const { couponValue } = pastSavedFlyer;
      let promoInfo = " ";
      if (couponValue.length > 0) {
        let cash = "Cash Discount";
        let per = "Percentage Discount";
        couponValue.map((item) => {
          if (item.valueType == "PERCENTAGE_DISCOUNT") {
            per = per + " " + item.amount * 100 + "%";
          } else {
            cash = cash + " " + `$${item.amount}`;
          }
        });
        if (per.length > 19 && cash.length > 13) {
          promoInfo = per + " " + cash;
        } else {
          promoInfo = per.length > 19 ? per : cash;
        }

        // console.log(promoInfo)

        if (couponValue) {
          const modelName = vendor + "_" + "ItemCatalog";
          const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
          for(let singleCoupon of couponValue) {
            // console.log('singleCoupon itemsBound', singleCoupon)
            if(singleCoupon.itemsBound) {
              for(let item of singleCoupon.itemsBound) {
              await ItemCatalog.findOneAndUpdate({itemCode: item.itemCode}, 
              // { $push: { boundFlyers: {flyerId, couponId: singleCoupon.couponId}}, $set: { event: 'Yes'}})
              { $set: { event: 'Yes', boundFlyers: {flyerId, couponId: singleCoupon.couponId}}})
            }
            } else if (singleCoupon.valueType == 'PERCENTAGE_DISCOUNT' && singleCoupon.isForAllItems) {
              await ItemCatalog.updateMany({},{ $set: { boundFlyers: {flyerId, couponId: singleCoupon.couponId}}})
            }
            
          }
        }
      }
      const newFlyer = {
        businessTitle,
        businessCategory,
        logo,
        flyerId,
        flyerTitle,
        flyerType,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        promoInfo: flyerType === "FLYER" ? " " : promoInfo,
        crossBoundary,
        targetDistribute: true
      };

      for(let resident of residentList){
        await Resident.findOneAndUpdate({ residentName: resident }, { $push: { targetFlyers: newFlyer }})
      }

      // const vendorInActive = await ActiveFlyer.findOne({
      //   businessTitle,
      // });

      // if (vendorInActive) {
      //   await ActiveFlyer.findOneAndUpdate(
      //     {
      //       businessTitle,
      //     },
      //     {
      //       $push: {
      //         vendorActiveFlyer: newFlyer,
      //       },
      //     }
      //   );
      // } else {
      //   await new ActiveFlyer({
      //     businessTitle,
      //     businessCategory,
      //     logo,
      //     vendorActiveFlyer: newFlyer,
      //   }).save();
      // }

      // const activeFlyers = await ActiveFlyer.find({})

      //  pubsub.publish("UPDATE_ACTIVE_FLYERS", { 
      //   updateActiveFlyers: activeFlyers,
      // });



      const addedFlyer = {
        businessTitle,
        businessCategory,
        flyerId,
        flyerTitle,
        flyerType,
        dateFrom,
        dateTo,
        promoInfo,
        crossBoundary,
        targetDistribute: true
      };

      // Broadcast the subscription
      pubsub.publish("FLYER_ADDED", {
        flyerAdded: addedFlyer,
      });
      return addedFlyer;
    } else {
      throw new Error("This flyer does not exist!");
    }
  },

  feedPet: async (_, {flyerId, residentName, stashOrActive, petExperienceGained, targetDistribute,
    silverRewarded}, {Resident, Pet, Guild}) => {

      // await Resident.aggregate([
      //   { $match: { residentName } },
      //   { $set: { $push: {flyersFedToPet: flyerId}} },
      //   { $set: { $inc: {silverCoins: silverRewarded, petExperience: petExperienceGained}} }
      // ]);


        // await Resident
        // .findOneAndUpdate(
        //   {residentName}, 
        //   [ { $set: { $push: {flyersFedToPet: flyerId}} },
        //     { $set: { $inc: {silverCoins: silverRewarded, petExperience: petExperienceGained}} }]
        // )
       const resident = await Resident
        .findOneAndUpdate(
          {residentName}, 
          {$push: {flyersFedToPet: flyerId}}).populate({path: "guild", model: Guild})
// console.log(resident)
        if(resident.guild) {
          // console.log(resident.guild)
          await Guild.findOneAndUpdate({ guildFullName: resident.guild.guildFullName}, 
            { $inc: {guildSilver: Math.round(silverRewarded * resident.guild.contributionRatio) }})
        }
        await Resident
        .findOneAndUpdate(
          {residentName}, 
          { $inc: {silverCoins: resident.guild ? Math.round(silverRewarded * ( 1 - resident.guild.contributionRatio)): silverRewarded , 
            petExperience: petExperienceGained}})

    if (stashOrActive == "Stash") {
        await Resident
          .findOneAndUpdate({residentName},{$pull: {stashedFlyers: {flyerId}}})
      } 

      const currentResident = await Resident.findOne({residentName})
                                            .populate([{path: "pet",model: Pet}, {path: "guild", model: Guild}]);
      // console.log(currentResident)
      return currentResident
  },

  fulfill: async(_, {vendor, orderNo, fulfillNote}, {}) => {
    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
      newVendor +
      process.env.MONGO_URI_SUFFIX;

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelVendorOrder = newVendor + "_" + "VendorOrder"
    const VendorOrder = newConn.model(modelVendorOrder, VendorOrderSchema)
    await VendorOrder.findOneAndUpdate({ orderNo }, { $set: {isFulfilled: true, fulfillNote}})
    return { note: fulfillNote }
  },

  joinGuild: async(_, { residentName, nickName, avatar, guildId, lat, lng },{ Resident, Guild}) => {
    const guild = await Guild.findOneAndUpdate({_id: guildId}, 
                                                { $push: 
                                                  {guildMembers: {
                                                        name:residentName, 
                                                        nickName,
                                                        avatar,
                                                        might: 0,
                                                        rank: 1,
                                                        lat,
                                                        lng,
                                                        lastRewardDate: ''
                                                      }
                                                    }
                                                  }, 
                                                  { new: true } )
     await Resident.findOneAndUpdate({ residentName }, { $set: { guild: guildId }}, { new: true })

     return guild
  },

  kickGuildMember: async(_, {guild, resident}, {Guild, Resident}) => {
    await Guild.findOneAndUpdate({guildFullName: guild}, {$pull:{guildMembers:{name: resident }}})
    await Resident.findOneAndUpdate({residentName: resident},{guild: null})
    return { name: resident}
  },

  placeOrder: async (_, {
                        resident, vendor, deliveryType, customerName, deliveryAddress, pickupAddress, 
                        valueDiscountList, totalDiscount, shipping, totalAmount, silverSpand, tax, 
                        paymentMethod,impendingOrderNo, dealsTitle, salesOrderItems, note}, 
                        {Resident, Guild, pubsub, Vendor, transporter, CityHall, GuildDeal, lodash }) => {
   
     // resident connection                     
     const revisedResident= resident.replace(/\s/g, "")
    //  console.log('revisedresident', revisedResident)
     const  newResident = revisedResident.replace(/\./g, "")
    //  console.log('newResident', newResident)
    
    const MONGO_URI =
    process.env.MONGO_URI_PREFIX +
     newResident +
    process.env.MONGO_URI_SUFFIX;

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    // vendor connection

    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI_Vendor =
    process.env.MONGO_URI_PREFIX +
     newVendor +
    process.env.MONGO_URI_SUFFIX;

    const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelNameCatalog = newVendor + "_" + "ItemCatalog";
    const ItemCatalog = newConnVendor.model(modelNameCatalog, ItemCatalogSchema);

    const cate = await Vendor.findOne({ businessTitle: vendor}).select('businessCategory')
    let isFood
    cate.businessCategory.map(item => {
      isFood = lodash.words(item).includes('product') || lodash.words(item).includes('service') ? false : true
    })

     //Todo resident part

    const modelShoppingCart = newResident + "_" + "ShoppingCart";
    const modelResidentOrder = newResident + "_" + "ResidentOrder"
    const ShoppingCart = newConn.model(modelShoppingCart, ShoppingCartSchema);
    const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)
    
    const residentOrderItem = []
    const shoppingCartItems = salesOrderItems.length > 0 ? salesOrderItems : await ShoppingCart.find({})
    let totalRewardSilver = 0
    let impendingOrder 
    const date = Date.now()
    const residentOrderNo = impendingOrderNo != '' ? impendingOrderNo : newVendor + date
    
    

    if(impendingOrderNo != '') {
     impendingOrder = await ResidentOrder.findOneAndUpdate({orderNo: impendingOrderNo},
      { $set: {
        impending: false,
        deliveryAddress,
        pickupAddress,
        deliveryType , 
        finalizeInfo: `Finalized at ${new Date().toString()}`,
        note,
        shipping,
        date,
        tax
      }}, {new: true} )
      totalRewardSilver = impendingOrder.totalRewardSilver
    } else {
    //  console.log('shoppingcartitem', shoppingCartItems)
    // Update Resident Order with Shopping Cart
    for(let item of shoppingCartItems) {
    //  console.log('item', item)


      let unitPrice = 0

      if (salesOrderItems.length > 0) {
          // unitPrice = item.dealPrice > 0 ? item.dealPrice : item.unitPrice
          unitPrice =  item.unitPrice
      } else 
      // if (valueDiscountList.length > 0) {
      //     const index = valueDiscountList.findIndex(v => v.itemCode == item.itemCode)
      //     unitPrice =  index >= 0 ? valueDiscountList[index].dealPrice
      //                           : (item.promoRate > 0 ? item.promoRate : item.rate)
      //   } else 
        {
          unitPrice = item.promoRate > 0 ? item.promoRate : item.rate
        }
      // console.log('tax', unitPrice * item.quantity * item.taxRate)
      // console.log('unitPrice', unitPrice)
      // console.log('quantity', item.quantity )
      // console.log('taxrate', item.taxRate)
      // console.log('item.itemCode',item.itemCode)
      const catalogItem = await ItemCatalog.findOne({itemCode: item.itemCode})
      // console.log('catalogItem',catalogItem)
     
   
      // console.log('residentorder', residentorder)

      residentOrderItem.push({
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
        // unitPrice: item.promoRate>0?item.promoRate:item.rate,
        unitPrice,
        taxRate: item.taxRate,
        photo: catalogItem.photo
      })

      totalRewardSilver = item.quantity * item.rewardSilver
    }

    for(let deal of dealsTitle) {
      if(deal.oneTimeUsage) {
        await Resident.findOneAndUpdate({ residentName: resident}, { $push: { usedCoupons: { flyerId: deal.flyerId, couponId: deal.couponId}}})
      }
    }

    const residentorder =  await new ResidentOrder({
      date,
      orderNo: residentOrderNo,
      vendor,
      tax,
      resident,
      deliveryAddress,
      pickupAddress,
      deliveryType,
      customerName,
      paymentMethod,
      dealsTitle,
      isFood,
      totalRewardSilver: totalRewardSilver + Math.floor((totalAmount - totalDiscount) * 0.035 * 0.15 *1000),
      silverSpand,
      impending: false,
      totalAmount,
      totalDiscount,
      shipping,
      orderItems: residentOrderItem,
      note
    }).save()

    if(silverSpand > 0) {
      await Resident.findOneAndUpdate({residentName: resident}, 
                                    {
                                      $push: { silverRecords: {
                                                                date,
                                                                orderNo: residentOrderNo,
                                                                vendor,
                                                                amountSpand: silverSpand
                                                              }},
                                      $inc: {silverCoins: -silverSpand}}
                                      )
                      
    }

        //  Publish Resident Order Subscription
        const residentOrderAdded = {
          date,
          orderNo: residentOrderNo,
          vendor,
          resident,
          deliveryAddress,
          pickupAddress,
          deliveryType,
          customerName,
          paymentMethod,
          impending: false,
          dealsTitle,
          isFood,
          totalRewardSilver: totalRewardSilver + Math.floor((totalAmount - totalDiscount) * 0.035 * 0.15 *1000),
          silverSpand,
          finalizeInfo: '',
          isGameSubstitueBuy: false,
          isUnderDispute: false,
          isCanceled: false,
          isConfirmed: false,
          disputeInfo: '',
          totalAmount, //* excluding tax
          totalDiscount,
          shipping,
          tax,
          orderItems: residentOrderItem,
          note
        }
        pubsub.publish("RESIDENT_ORDER_ADDED", {residentOrderAdded})
    }
   


    //TODO vendor part
    const modelVendorOrder = newVendor + "_" + "VendorOrder";
    const VendorOrder = newConnVendor.model(modelVendorOrder,  VendorOrderSchema);

    
    const vendorOrderNo = impendingOrderNo == '' ? newVendor + date : impendingOrderNo
    const vendorOrderItem = []
    const confirmedOrderList = []
    const theVendor = await Vendor.findOneAndUpdate({businessTitle: vendor}, 
      {$set:{goldCoins: Math.round(silverSpand / 1000)} },{new : true} )

   if(impendingOrderNo != ''){
    for(let item of impendingOrder.orderItems){
      const catalogItem = await ItemCatalog.findOne({itemCode: item.itemCode})

    await new VendorOrder({
      date,
      orderNo: vendorOrderNo,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemCode: item.itemCode,
      tax: item.unitPrice * item.quantity 
      * item.taxRate,
      totalDiscount,
      shipping,
      taxRate: item.taxRate,
      deliveryAddress,
      pickupAddress,
      deliveryType,
      customerName,
      resident,
      vendor,
      paymentMethod,
      dealsTitle,
      note
    }).save()

    
    vendorOrderItem.push({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      itemCode: item.itemCode,
      taxRate: item.taxRate,
      // isFulfilled: false
    })

    confirmedOrderList.push({
      description: item.description,
      itemPrice:  formatAmount(item.unitPrice),
      quantity: item.quantity.toString(),
      photo: catalogItem.photo,
      itemTotal: formatAmount(item.unitPrice * item.quantity)
    })
    }
   } else {
    for(let item of shoppingCartItems) {
    let unitPrice = 0
    if (salesOrderItems.length > 0) {
      unitPrice =  item.unitPrice
    } else 
    // if (valueDiscountList.length > 0) {
    //   const index = valueDiscountList.findIndex(v => v.itemCode == item.itemCode)
    //   unitPrice =  index >= 0 ? valueDiscountList[index].dealPrice
    //                         : (item.promoRate > 0 ? item.promoRate : item.rate)
    // } else 
    {
      unitPrice = item.promoRate > 0 ? item.promoRate : item.rate
    }
      const catalogItem = await ItemCatalog.findOne({itemCode: item.itemCode})

      await new VendorOrder({
        date,
        orderNo: vendorOrderNo,
        description: item.description,
        quantity: item.quantity,
        unitPrice,
        itemCode: item.itemCode,
        tax: unitPrice * item.quantity * item.taxRate,
        totalDiscount,
        shipping,
        taxRate: item.taxRate,
        deliveryAddress,
        pickupAddress,
        deliveryType,
        customerName,
        resident,
        vendor,
        paymentMethod,
        dealsTitle,
        note
      }).save()

      
      vendorOrderItem.push({
        description: item.description,
        quantity: item.quantity,
        unitPrice,
        itemCode: item.itemCode,
        taxRate: item.taxRate,
        // isFulfilled: false
      })

      confirmedOrderList.push({
        description: item.description,
        itemPrice:  formatAmount(unitPrice),
        quantity: item.quantity.toString(),
        photo: catalogItem.photo,
        itemTotal: formatAmount(unitPrice * item.quantity)
      })
         
    }
   }
    // process deals title
    if(dealsTitle.length > 0){
      const modelNameSavedFlyer = newVendor + "_" + "SavedFlyer";
      const SavedFlyer = newConnVendor.model(modelNameSavedFlyer, FlyerSchema);
      for(let item of dealsTitle){
        await SavedFlyer.findOneAndUpdate({flyerId: item.flyerId}, { $inc: { quantityRedeemed: 1, salesGenerated: totalAmount }})
      }
    }

    const vendorOrderAdded = {
      date,
      orderNo: vendorOrderNo,
      tax,
      totalAmount,
      totalDiscount,
      shipping,
      deliveryType,
      customerName,
      deliveryAddress,
      pickupAddress,
      resident,
      vendor,
      isUnderDispute: false,
      isCanceled: false,
      isConfirmed: false,
      disputeInfo: '',
      paymentMethod,
      orderItems: vendorOrderItem,
      note
    }
    // console.log('totalRewardSilver', totalRewardSilver)
    const vendorSettlementRecord = {
            date,
            vendor,
            salesOrderNo: vendorOrderNo,
            purchaseOrderNo: '',
            totalAmount: totalAmount - totalDiscount +  tax + shipping ,
            totalDiscount,
            tax,
            boundaryGold: impendingOrderNo != '' ? impendingOrder.silverSpand / 1000 : Math.round(silverSpand / 1000),
            paymentMethod,
            boundaryPayable: theVendor.boundaryCharge ?  (totalAmount - totalDiscount)  * theVendor.boundaryCharge + totalRewardSilver / 1000 : 0,
            amountPaidByCustomer: totalAmount - totalDiscount + tax + shipping  - (impendingOrderNo != '' ? impendingOrder.silverSpand / 1000 : Math.round(silverSpand / 1000)),
            amountPaidToBoundary: theVendor.boundaryCharge ?  (totalAmount - totalDiscount)  * theVendor.boundaryCharge : 0,
        }

    const modelVendorSettlement = newVendor + "_" + "VendorSettlement"
    // console.log(modelVendorSettlement)
    const VendorSettlement = newConnVendor.model(modelVendorSettlement, VendorSettlementSchema)

    const oldResident = await Resident.findOne({residentName: resident}) 
    
    const existingCustomer = await Vendor.findOne({$and:[{businessTitle: vendor}, {"existingCustomerList.customer": customerName}]})

   if(existingCustomer) 
   {
    await Vendor.findOneAndUpdate({$and:[{businessTitle: vendor}, {"existingCustomerList.customer": customerName}]},
    {
    $set: {"existingCustomerList.$[el].dateLastTimePurchase": date.toString()}, 
    $inc: { "existingCustomerList.$[el].purchaseTimes" : 1, "existingCustomerList.$[el].totalPurchaseAmount":  totalAmount - totalDiscount}
    }, 
    { arrayFilters: [{ "el.customer": customerName}]})
   } 
   else 
  { 
    await Vendor.findOneAndUpdate({businessTitle: vendor}, { $push: { existingCustomerList:  
    {customer: customerName,
    location: oldResident.mailCity,
    purchaseTimes: 1,
    totalPurchaseAmount: totalAmount - totalDiscount,
    dateLastTimePurchase: date.toString()} }})
  }
   

    // console.log(VendorSettlement)

   const set = await new VendorSettlement(vendorSettlementRecord).save()
  //  console.log(set)

    pubsub.publish("VENDOR_ORDER_ADDED", {vendorOrderAdded})
    pubsub.publish("VENDOR_SETTLEMENT_RECORD_ADDED", {vendorSettlementRecordAdded: vendorSettlementRecord})
  



    //TODO Guild part
    
    const theResident = await Resident.findOneAndUpdate({residentName: resident}, 
                                                        { $set: {silverCoins: oldResident.silverCoins + Math.round(totalRewardSilver * ( 1 - oldResident.propertyTax))}},
                                                        {new: true})
    const treasure = await CityHall.findOneAndUpdate({}, { $inc: { treasure:  Math.round(totalRewardSilver * theResident.propertyTax) }})
    pubsub.publish("CITYHALL_UPDATED", {cityhallUpdated: {treasure: Math.round(totalRewardSilver * theResident.propertyTax),
                                                          might: 0,
                                                          population: 0,
                                                          metro: treasure.metro
                                                        }})                            
    // .populate( { path: "guild ", ref: "Guild", select: ['guildFullName']})
      // console.log(theResident.guild)
      
    if(theResident.guild) {
        const guildOld = await Guild.findOne({_id: theResident.guild})
        const guild = await Guild.findOneAndUpdate({_id: theResident.guild}, 
                // {  $inc: { guildSilver: Math.round(totalRewardSilver * 0.1), guildScores: totalRewardSilver * 0.1 * 10 } }
                { $set: { guildSilver: guildOld.guildSilver + Math.round(totalRewardSilver * guildOld.contributionRatio * 0.85), 
                          guildScores: guildOld.guildScores + Math.round(totalRewardSilver * guildOld.contributionRatio * 10 ) }})

              const contribution = await Guild.findOne({ $and:[{'currentMonthContribution.name': theResident.residentName}, {_id: theResident.guild}]})
              // console.log('contribution', contribution)
              if(contribution) {
                await Guild.findOneAndUpdate({  _id: theResident.guild}, 
                { $inc: {"currentMonthContribution.$[el].amount": Math.round(totalRewardSilver * contribution.contributionRatio * 0.85)}},
                { arrayFilters: [{ "el.name": theResident.residentName}]})
                await Guild.findOneAndUpdate({  _id: theResident.guild},{ $inc: { guildLeaderRemun: Math.round(totalRewardSilver * contribution.contributionRatio * 0.15)}})
              } else {
                await Guild.findOneAndUpdate({_id: theResident.guild}, 
                { $push: {currentMonthContribution: {
                  amount: Math.round(totalRewardSilver * guild.contributionRatio * 0.85),
                  name: theResident.residentName,
                  nickName: theResident.nickName
                }}}) 
                await Guild.findOneAndUpdate({  _id: theResident.guild},{ $inc: { guildLeaderRemun: Math.round(totalRewardSilver * guild.contributionRatio * 0.15)}})
              }
      
              const newGuildFullName = guild.guildFullName.replace(/\s/g, "")
              // console.log(guildDealIds)
                const MONGO_URI_GUILD =
                  process.env.MONGO_URI_PREFIX +
                  newGuildFullName  +
                  process.env.MONGO_URI_SUFFIX;
                const newConn_guild = await mongoose.createConnection(MONGO_URI_GUILD, {
                  useNewUrlParser: true,
                  useCreateIndex: true,
                  useUnifiedTopology: true,
                  useFindAndModify: false,
                });
                const modelName_guild = newGuildFullName + "_" + "GuildDealsStatus";
                const GuildDealsStatus = newConn_guild.model(modelName_guild, GuildDealStatusSchema); 
                const status = await GuildDealsStatus.findOneAndUpdate({$and:[{vendor}, {active: true}]}, { $push: { transactions: {
                                                                                            date,
                                                                                            transactionId: vendorOrderNo,
                                                                                            resident: theResident.nickName,
                                                                                            vendor,
                                                                                            purchaseAmount: totalAmount,
                                                                                            }}})   
                const tranAdded = {date,
                  transactionId: vendorOrderNo,
                  resident: theResident.nickName,
                  vendor,
                  purchaseAmount: totalAmount}
                // console.log(tranAdded)
                pubsub.publish("GUILD_DEAL_TRANSACTION_ADDED", {guildDealTransactionAdded: tranAdded})                                                                          
              if(status) {
                await GuildDeal.findOneAndUpdate({dealNo: status.dealNo}, {$inc: {"dealFulfillmentRecords.$[el].purchaseAmount": totalAmount}}, 
                { arrayFilters: [{ "el.guild": guild.guildFullName}]})
              }
               const leader = await Resident.findOneAndUpdate({residentName: guild.guildFullName}, 
                                                              {$inc: { silverCoins:  Math.round(totalRewardSilver * guild.contributionRatio * guild.leaderBenefit)}})

               
      }

    await ShoppingCart.deleteMany({})  

    //TODO email customer confirmation 

    
    const url = `http://localhost:4000/${residentOrderNo}`;
    const handlebarOptions = {
      viewEngine: {
        extName: ".handlebars",
        partialsDir: "./views/",
        layoutsDir: "./views/",
        defaultLayout: "orderConfirmation",
      },
      viewPath: "./views/",
      extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarOptions));
    transporter.use(
      "compile",
      inlineBase64({
        cidPrefix: "somePrefix_",
      })
    );
   
    const mailOptions = {
      to: theResident.email,
      subject: " Order Confirmation  - don't reply ",
      template: "orderConfirmation",
      context: {
        url,
        orderNo: residentOrderNo,
        name: theResident.firstName + ' ' + theResident.lastName,
        base64: LOGO_BASE64,
        vendor,
        confirmedOrderList,
        totalBeforeTax: formatAmount(totalAmount - totalDiscount),
        totalAmount: formatAmount(totalAmount + tax + shipping - totalDiscount),
        totalDiscount: formatAmount(totalDiscount),
        tax: formatAmount(tax),
        paidBy: paymentMethod,
        note,
        isNote: note == '' || note == null ? false : true,
        shipping: formatAmount(shipping),
        totalRewardSilver: formatSilverAmount(totalRewardSilver + Math.round((totalAmount - totalDiscount) * 0.035 * 0.15 *1000))
      },
    };

    transporter.sendMail(mailOptions, function(err, info) {
      if (err) console.log(err);
      else console.log(info);
    });

    // graphql return
    const  aggregationResult = await ResidentOrder.aggregate([
      { $group: { _id: '$orderNo', 
                  date: { $first: '$date'},
                  orderNo: { $first: '$orderNo'},
                  vendor: { $first: '$vendor' },
                  resident: { $first: '$resident' },
                  deliveryType: { $first: '$deliveryType' },
                  customerName: { $first: '$customerName'},
                  deliveryAddress: { $first: '$deliveryAddress' },
                  pickupAddress: { $first: '$pickupAddress' },
                  totalDiscount: { $first: '$totalDiscount'},
                  shipping: { $first: '$shipping'},
                  totalAmount: { $first: '$totalAmount' },
                  paymentMethod: { $first: '$paymentMethod'},
                  impending: {$first: '$impending'},
                  dealsTitle: {$first: '$dealsTitle'},
                  isFood: {$first: '$isFood'},
                  totalRewardSilver: {$first: '$totalRewardSilver'},
                  silverSpand: {$first: '$silverSpand'},
                  finalizeInfo: {$first: '$finalizeInfo'},
                  isGameSubstitueBuy: {$first: '$isGameSubstitueBuy'},
                  isUnderDispute: {$first: '$isUnderDispute'},
                  isCanceled: {$first: '$isCanceled'},
                  isConfirmed: {$first: '$isConfirmed'},
                  disputeInfo: {$first: '$disputeInfo'},
                  note:{$first: '$note'},
                  tax: { $first: '$tax' },
                  orderItems: {$first: '$orderItems'} ? {$first: '$orderItems'} : { $push: {
                    itemCode: '$itemCode',
                    description: '$description',
                    quantity: '$quantity',
                    unitPrice: '$unitPrice',
                    taxRate: '$taxRate',
                    photo: '$photo'
                  }}
                }}])
      // console.log(aggregationResult)
     return aggregationResult
    
  },

  prepay: async(_, {
    vendor,
    resident,
    customerName,
    totalAmount,
    totalDiscount,
    silverSpand,
    dealsTitle,
    valueDiscountList,
    tax,
    paymentMethod}, {Resident, Guild, pubsub, Vendor, lodash}) => {
      const revisedResident= resident.replace(/\s/g, "")
      //  console.log('revisedresident', revisedResident)
      const  newResident = revisedResident.replace(/\./g, "")
      //  console.log('newResident', newResident)
      
      const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
        newResident +
      process.env.MONGO_URI_SUFFIX;
  
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
                                
      // vendor connection
      const newVendor= vendor.replace(/\s/g, "")
  
      const MONGO_URI_Vendor =
      process.env.MONGO_URI_PREFIX +
        newVendor +
      process.env.MONGO_URI_SUFFIX;
  
      const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
                                
      const modelNameCatalog = newVendor + "_" + "ItemCatalog";
      const ItemCatalog = newConnVendor.model(modelNameCatalog, ItemCatalogSchema);

      const cate = await Vendor.findOne({ businessTitle: vendor}).select('businessCategory')
      let isFood
      cate.businessCategory.map(item => {
        isFood =lodash.words(item).includes('product') ||lodash.words(item).includes('service') ? false : true
      })
                                

      const modelResidentOrder = newResident + "_" + "ResidentOrder"
      const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)

      const modelShoppingCart = newResident + "_" + "ShoppingCart";
    const ShoppingCart = newConn.model(modelShoppingCart, ShoppingCartSchema);
    
    const residentOrderItem = []
    const shoppingCartItems = await ShoppingCart.find({})
  
      let totalRewardSilver = 0
      const dateNew = Date.now()
      const residentOrderNo =  newVendor + dateNew

      for(let item of shoppingCartItems) {
        let unitPrice = 0
        // if (valueDiscountList.length > 0) {
        //   const index = valueDiscountList.findIndex(v => v.itemCode == item.itemCode)
        //   unitPrice =  index >= 0 ? valueDiscountList[index].dealPrice
        //                         : (item.promoRate > 0 ? item.promoRate : item.rate)
        // } else {
          unitPrice = item.promoRate > 0 ? item.promoRate : item.rate
        // }

         const catalogItem = await ItemCatalog.findOne({itemCode: item.itemCode})
        
         residentOrderItem.push({
          itemCode: item.itemCode,
          description: item.description,
          quantity: item.quantity,
          // unitPrice: item.promoRate>0?item.promoRate:item.rate,
          unitPrice,
          taxRate: item.taxRate,
          photo: catalogItem.photo
        })
        totalRewardSilver = item.quantity * item.rewardSilver
      }
  
      for(let deal of dealsTitle) {
        if(deal.oneTimeUsage) {
          await Resident.findOneAndUpdate({ residentName: resident}, { $push: { usedCoupons: { flyerId: deal.flyerId, couponId: deal.couponId}}})
        }
      }
       

         await new ResidentOrder({
          date: dateNew,
          orderNo: residentOrderNo,
          tax,
          vendor,
          resident,
          deliveryAddress: '',
          pickupAddress: '',
          deliveryType: '',
          customerName, 
          paymentMethod,
          shipping: 0,
          impending: true,
          dealsTitle,
          isFood,
          totalRewardSilver: totalRewardSilver + Math.round((totalAmount - totalDiscount) * 0.035 * 0.15 *1000),
          silverSpand,
          isGameSubstitueBuy: false,
          totalAmount,
          totalDiscount,
          orderItems: residentOrderItem,
          note: ''
        }).save()
  
        // console.log('residentorder', residentorder)
      
    
        if(silverSpand > 0) {
          await Resident.findOneAndUpdate({residentName: resident}, 
                                        {
                                          $push: { silverRecords: {
                                                                    date: dateNew,
                                                                    orderNo: residentOrderNo,
                                                                    vendor,
                                                                    amountSpand: silverSpand
                                                                  }},$inc: {silverCoins: -silverSpand}}
                                        
                                          )
                          
        }
    
  
      //  Publish Resident Order Subscription
      const residentOrderAdded = {
        date: dateNew,
        orderNo: residentOrderNo,
        vendor,
        resident,
        deliveryAddress: ' ',
        pickupAddress: ' ',
        deliveryType: ' ',
        shipping: 0,
        customerName,
        paymentMethod,
        impending: true,
        dealsTitle,
        isFood,
        totalRewardSilver: totalRewardSilver + Math.round((totalAmount - totalDiscount) * 0.035 * 0.15 *1000),
        silverSpand,
        finalizeInfo: '',
        isGameSubstitueBuy: true,
        isUnderDispute: false,
        isCanceled: false,
        isConfirmed: false,
        disputeInfo: '',
        totalAmount, //* excluding tax
        totalDiscount,
        tax,
        orderItems: residentOrderItem,
        note: ''
      }
      pubsub.publish("RESIDENT_ORDER_ADDED", {residentOrderAdded})

      // if(dealsTitle.length > 0){
      //   const modelNameSavedFlyer = newVendor + "_" + "SavedFlyer";
      //   const SavedFlyer = newConnVendor.model(modelNameSavedFlyer, FlyerSchema);
      //   for(let item of dealsTitle){
      //     await SavedFlyer.findOneAndUpdate({flyerId: item.flyerId}, { $inc: { quantityRedeemed: 1, salesGenerated: totalAmount - tax }})
      //   }
      // }
      await ShoppingCart.deleteMany({}) 
      const  aggregationResult = await ResidentOrder.aggregate([
        { $group: { _id: '$orderNo', 
                    date: { $first: '$date'},
                    orderNo: { $first: '$orderNo'},
                    vendor: { $first: '$vendor' },
                    resident: { $first: '$resident' },
                    deliveryType: { $first: '$deliveryType' },
                    customerName: { $first: '$customerName'},
                    deliveryAddress: { $first: '$deliveryAddress' },
                    pickupAddress: { $first: '$pickupAddress' },
                    totalDiscount: { $first: '$totalDiscount'},
                    shipping: { $first: '$shipping'},
                    totalAmount: { $first: '$totalAmount' },
                    paymentMethod: { $first: '$paymentMethod'},
                    impending: {$first: '$impending'},
                    dealsTitle: {$first: '$dealsTitle'},
                    isFood: {$first: '$isFood'},
                    totalRewardSilver: {$first: '$totalRewardSilver'},
                    silverSpand: {$first: '$silverSpand'},
                    finalizeInfo: {$first: '$finalizeInfo'},
                    isGameSubstitueBuy: {$first: '$isGameSubstitueBuy'},
                    isUnderDispute: {$first: '$isUnderDispute'},
                    isCanceled: {$first: '$isCanceled'},
                    isConfirmed: {$first: '$isConfirmed'},
                    disputeInfo: {$first: '$disputeInfo'},
                    note:{$first: '$note'},
                    tax: { $first: '$tax' },
                    orderItems: {$first: '$orderItems'} ? {$first: '$orderItems'} : { $push: {
                      itemCode: '$itemCode',
                      description: '$description',
                      quantity: '$quantity',
                      unitPrice: '$unitPrice',
                      taxRate: '$taxRate',
                      photo: '$photo'
                    }}
                  }}])
        // console.log(aggregationResult)
       return aggregationResult
  },

  promoteGuildMember: async(_, { guild, resident, newRank}, {Guild}) => {
    await Guild.findOneAndUpdate(
      {"guildFullName": guild},
      {$set: {"guildMembers.$[elem].rank": newRank}}, 
      { arrayFilters: [{ "elem.name": resident }]}
    )
    return { name: resident, newRank}
    },

  quitGuild: async(_, { residentName, guildFullName}, {Resident, Guild}) => {
     await Guild.findOneAndUpdate({ guildFullName}, {$pull: { guildMembers: { name: residentName }}})
    const resident = await Resident.findOneAndUpdate({residentName}, { $set: { guild: null }})
    return { residentName: resident.residentName, nickName: resident.nickName}
  },

  readMessage: async(_, { sender, receiver, guild, time, type}, { Resident, Vendor }) => {
    // console.log(type)
    // console.log(sender)
    // console.log(receiver)
    // console.log(time)
    switch (type) {
      case 'vendor':
      // const newP =  
      await  Resident.findOneAndUpdate({residentName: receiver}, 
        {$set: {"messages.$[el].isRead": true}}, 
       { arrayFilters: [{ "el.sender": sender, "el.time": time}]})
      //  console.log(newP)
       break;
      case 'guild':
        await Resident.findOneAndUpdate({residentName: receiver}, 
          {$set: {"guildMessages.$[el].isRead": true}}, 
        { arrayFilters: [{ "el.guild": guild, "el.time": time}]})
        break;
      case 'resident':
       const record =  await Vendor.findOneAndUpdate({businessTitle: receiver},
          {$set: {"messages.$[el].isRead": true}}, 
        { arrayFilters: [{ "el.sender": sender, "el.time": time}]})
        // console.log(record)
      break;
    }

    return {sender, receiver, guild, time}
  },


  rewardGuildMember: async(_, { resident, guild, silverAmount}, {Resident, Guild}) => {
    await Resident.findOneAndUpdate(
      {residentName: resident },
      {$inc: {silverCoins: silverAmount}}, 
    )
    await Guild.findOneAndUpdate({ guildFullName: guild }, { $inc: { guildSilver: -silverAmount }})
     await Guild.findOneAndUpdate({guildFullName: guild},
          {$set: {"guildMembers.$[el].lastRewardDate": Date.now().toString()}}, 
        { arrayFilters: [{ "el.name": resident}]})
    return { name: resident, silverAmount}
    },


  saveCustomerRating: async(_, {vendor, residentId, rating, comments,  time}, {Resident, Vendor, pubsub}) => {
    const newVendor = vendor.replace(/\s/g, "")

    const MONGO_URI =
    process.env.MONGO_URI_PREFIX +
    newVendor  +
    process.env.MONGO_URI_SUFFIX;

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelNameRating = newVendor + "_" + "CustomerRating";
    const CustomerRating = newConn.model(modelNameRating, CustomerCommentSchema);
    const ratingAdded = await new CustomerRating({residentId, rating, comments,  time}).save()

    const customerRating = await CustomerRating.findOne({_id: ratingAdded._id}).populate( { path: "residentId", model: Resident, select: ['residentName', 'avatarPic', 'nickName', 'firstName', 'lastName']})
  
  // console.log('productRatingsub', productRating)
  
    pubsub.publish('CUSTOMER_RATING_ADDED', {customerRatingAdded: { 
      resident: customerRating.residentId.residentName,
      customerName: customerRating.residentId.firstName + ' ' +customerRating.residentId.lastName,
      customerAvatar: customerRating.residentId.avatarPic,
      comments: customerRating.comments,
      time: customerRating.time,
      rating: customerRating.rating,
      vendor
    }})

    const customerRatings =   await CustomerRating.find({})
    let totalRating = 0
                                
    // console.log(customerRatings)
    const customerRatingList = customerRatings.map(async(item) => {
      totalRating = totalRating + item.rating
      const resident = await Resident.findOne({_id: item.residentId})
      return {
        resident: resident.residentName,
        customerName: resident.nickName,
        customerAvatar: resident.avatarPic,
        rating: item.rating,
        comments: item.comments,
        time: item.time,
        vendor
      }
  })
    await Vendor.findOneAndUpdate({businessTitle: vendor}, { $set: { rating: totalRating / customerRatings.length }})
    return customerRatingList
  },

  saveFlyer: async (_, { input }, {}) => {
    if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
      const {
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
        businessTitle,
        couponPages,
        flyerPage_C,
      } = input;
      // console.log(Date.now().toString());
      // FlyerSchema.plugin(beautifyUnique)
      const vendor = businessTitle.replace(/\s/g, "")
      const MONGO_URI =
        process.env.MONGO_URI_PREFIX +
         vendor +
        process.env.MONGO_URI_SUFFIX;
      // console.log(MONGO_URI)
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelName = vendor + "_" + "SavedFlyer";
      const modelNameSketch = vendor + "_" + "SavedSketch";
      const SavedSketch = newConn.model(modelNameSketch, SketchSchema);
      const SavedFlyer = newConn.model(modelName, FlyerSchema);

      await SavedSketch.findOneAndRemove({flyerId})
     
      const newSavedFlyer = await new SavedFlyer({
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
        vendor: businessTitle,
        couponPages,
        flyerPage_C,
      }).save();
      // console.log(newSavedFlyer);
      // const sketchModel = businessTitle + "_" + "SavedSketch";
      // const SavedSketch = newConn.model(sketchModel, SketchSchema);
      // await SavedSketch.findOneAndDelete(
      //   {
      //     flyerId: newSavedFlyer.flyerId,
      //   },
      //   (err) => {
      //     // console.log(err);
      //   }
      // );

      return newSavedFlyer;
      // }
    } else {
      throw new Error(
        "This size of flyer is over limit, please downsize photos or texts"
      );
    }
  },

  saveGuildDeals: async (_, { input }, { GuildDeal }) => {
    const {
      vendor,
      vendorLogo,
      vendorCategory,
      guildDealType,
      dealRedeemTerm,
      specificItemList,
      guildDealLevels,
      dateFrom,
      dateTo
          } = input
      const dealNo = vendor.replace(/\s/g, "") + 'G' + Date.now().toString()
      await new GuildDeal({
        vendor,
        vendorLogo,
        vendorCategory,
        guildDealType,
        dealRedeemTerm,
        specificItemList,
        guildDealLevels,
        dateFrom,
        dateTo,
        dealNo
      }).save()
     const guildDealsBack = await GuildDeal.find({vendor})

    return guildDealsBack
  },

  saveGuildChat: async (_, {residentId, guildFullName, input}, { Resident, Guild, pubsub }) => {
    const newGuildFullName = guildFullName.replace(/\s/g, "")
    const MONGO_URI =
        process.env.MONGO_URI_PREFIX +
        newGuildFullName +
        process.env.MONGO_URI_SUFFIX;
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      // if (input.type == 'text') {
      //   input.data = { text: input.data}
      // }
      // if (input.type == 'emoji') {
      //   input.data = { emoji: input.data}
      // }
      const modelName = newGuildFullName + "_" + "GuildChat";
      const GuildChat = newConn.model(modelName, GuildChatSchema);
      const guildChat = await  new GuildChat({ residentId, message: input}).save()
      // console.log('guildChat', guildChat)
      const resident = await Resident.findOne({_id: residentId})
      // console.log('resident', resident)
      const guildMembers = await Guild.findOne({ guildFullName }).select('guildMembers')
      // console.log('guildMembers', guildMembers)
      const index = guildMembers.guildMembers.findIndex(member => resident.residentName === member.name)
      // console.log('index', index)
      const guildChatMsgAdded = {
        guildFullName,
        message: input,
        residentName: resident.residentName,
        residentAvatar: resident.avatarPic,
        rank: guildMembers.guildMembers[index].rank
      }
      pubsub.publish('GUILD_CHAT_MSG_ADDED', {guildChatMsgAdded})
      return guildChatMsgAdded
  },

  savePrepaidVendorItem: async(_, {vendor, 
                                    resident, 
                                    vendorItemCode, 
                                    vendorItemPrice, 
                                    quantity, 
                                    date}, {Resident, Vendor, pubsub}) => {

        // resident connection                            
        const revisedResident= resident.replace(/\s/g, "")
        //  console.log('revisedresident', revisedResident)
        const  newResident = revisedResident.replace(/\./g, "")
        //  console.log('newResident', newResident)
        
        const MONGO_URI =
        process.env.MONGO_URI_PREFIX +
          newResident +
        process.env.MONGO_URI_SUFFIX;
    
        const newConn = await mongoose.createConnection(MONGO_URI, {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        });
                                  
        // vendor connection
        const newVendor= vendor.replace(/\s/g, "")
    
        const MONGO_URI_Vendor =
        process.env.MONGO_URI_PREFIX +
          newVendor +
        process.env.MONGO_URI_SUFFIX;
    
        const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor, {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        });
                                  
        const modelNameCatalog = newVendor + "_" + "ItemCatalog";
        const ItemCatalog = newConnVendor.model(modelNameCatalog, ItemCatalogSchema);
                                  

        const modelResidentOrder = newResident + "_" + "ResidentOrder"
        const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)
                                      
    
        // let totalRewardSilver = 0
        const dateNew = Date.now()
        const residentOrderNo =  newVendor + dateNew
    
       
        
        
        const residentOrderItem = []
        
    
          // console.log('shoppingcartitem', shoppingCartItems)
        // Update Resident Order with Shopping Cart
       
          // console.log('tax', unitPrice * item.quantity * item.taxRate)
          // console.log('unitPrice', unitPrice)
          // console.log('quantity', item.quantity )
          // console.log('taxrate', item.taxRate)
          // console.log('item.itemCode',item.itemCode)
          const catalogItem = await ItemCatalog.findOne({itemCode: vendorItemCode})
          const customer = await Resident.findOne({residentName: resident}).select(["firstName", "lastName"])
          // console.log('catalogItem',catalogItem)
          
          residentOrderItem.push({
            itemCode: vendorItemCode,
            description: catalogItem.description,
            quantity,
            // unitPrice: item.promoRate>0?item.promoRate:item.rate,
            unitPrice: vendorItemPrice,
            taxRate: catalogItem.taxRate,
            photo: catalogItem.photo
          })

           await new ResidentOrder({
            date: dateNew,
            orderNo: residentOrderNo,
            tax: vendorItemPrice * quantity * catalogItem.taxRate,
            vendor,
            resident,
            dealsTitle: [],
            orderItems: residentOrderItem,
            deliveryAddress: ' ',
            pickupAddress: ' ',
            deliveryType: ' ',
            customerName: customer.firstName + ' ' + customer.lastName, 
            paymentMethod: 'creditcard',
            shipping: 0,
            impending: true,
            isGameSubstitueBuy: true,
            totalAmount: vendorItemPrice * quantity ,
            totalDiscount: 0,
            note: ''
          }).save()
    
          // console.log('residentorder', residentorder)
    
    
        //  Publish Resident Order Subscription
        const residentOrderAdded = {
          date: dateNew,
          orderNo: residentOrderNo,
          vendor,
          resident,
          dealsTitle: [],
          deliveryAddress: ' ',
          pickupAddress: ' ',
          deliveryType: ' ',
          shipping: 0,
          customerName: customer.firstName + ' ' + customer.lastName,
          paymentMethod: 'creditcard',
          impending: true,
          finalizeInfo: '',
          isGameSubstitueBuy: true,
          isUnderDispute: false,
          isCanceled: false,
          isConfirmed: false,
          disputeInfo: '',
          totalAmount: vendorItemPrice * quantity, //* excluding tax
          totalDiscount: 0,
          tax: vendorItemPrice * quantity * catalogItem.taxRate,
          orderItems: residentOrderItem,
          note: ''
        }
        pubsub.publish("RESIDENT_ORDER_ADDED", {residentOrderAdded})
                                      
    
   
    // let promoInfo = " ";
    // if (couponValue.length > 0) {
      
    //   let cash = "Cash Discount";
    //   let per = "Percentage Discount";
    //   couponValue.map((item) => {
    //     if (item.valueType == "PERCENTAGE_DISCOUNT") {
    //       per = per + " " + item.amount * 100 + "%";
    //     } else {
    //       cash = item.valueType + " " + `$${item.amount}`;
    //     }
    //   });
    //   if (per.length > 19 && cash.length > 13) {
    //     promoInfo = per + " " + cash;
    //   } else {
    //     promoInfo = per.length > 19 ? per : cash;
    //   }
    // }
      // const vendorLogo = await Vendor.findOne({businessTitle: vendor}).select("logo")
         
      // for(let i = 0; i < quantity; i++) {
      //    await Resident.findOneAndUpdate(
      //   {residentName: resident},
      //   {$push: { 
      //     stashedFlyers: {
      //       vendor, 
      //       flyerId: savedFlyer.flyerId, 
      //       flyerTitle: savedFlyer.flyerTitle, 
      //       flyerType: savedFlyer.type, 
      //       dateFrom: savedFlyer.dateFrom, 
      //       dateTo: savedFlyer.dateTo, 
      //       promoInfo: savedFlyer.type == "FLYER" ? " " : promoInfo, 
      //       logo: vendorLogo.logo,
      //       targetDistribute: savedFlyer.targetDistribute
      //     }},
      //   }
      // )
      // }
     

      return {
        resident, 
        vendor, 
        vendorItemCode,
        vendorItemPrice,
        quantity,
        date: dateNew
      }
  },

  saveSingleItemRating: async (_, { vendor, itemCode, residentId, rating, comments, time }, {Resident, pubsub}) => {
    const newVendor = vendor.replace(/\s/g, "")

    const MONGO_URI =
    process.env.MONGO_URI_PREFIX +
     newVendor +
    process.env.MONGO_URI_SUFFIX;

  const newConn = await mongoose.createConnection(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  const modelProductRating = newVendor + "_" + "ProductItemsRating";
  const VendorProductRating = newConn.model(modelProductRating, ProductRatingSchema);
  
  const ratingAdded = await new VendorProductRating({itemCode, residentId, rating, comments, time}).save()
  const productRating = await VendorProductRating.findOne({_id: ratingAdded._id}).populate( { path: "residentId", model: Resident, select: ['residentName', 'avatarPic', 'nickName', 'firstName', 'lastName']})
  
  // console.log('productRatingsub', productRating)
  
  pubsub.publish('PRODUCT_RATING_ADDED', {productRatingAdded: { 
    resident: productRating.residentId.residentName,
    customerName: productRating.residentId.firstName + ' ' + productRating.residentId.lastName,
    customerAvatar: productRating.residentId.avatarPic,
    comments: productRating.comments,
    // reply: productRating.replay,
    time: productRating.time,
    rating: productRating.rating,
    itemCode: productRating.itemCode,
    vendor
  }})

  const  aggregationResult = await VendorProductRating.aggregate([
                                { $match : {itemCode}},
                                { $group: { _id: '$itemCode', averageRating: { $avg: "$rating" }}}])
  // console.log(aggregationResult)
  const vendorProductRatings = await VendorProductRating.find({itemCode}).populate( { path: "residentId", model: Resident, select: ['residentName', 'avatarPic', 'nickName']})
  
  const customerRatings = vendorProductRatings.map(item => {
    return {
      resident: item.residentId.residentName,
      customerName: item.residentId.nickName,
      customerAvatar: item.residentId.avatarPic,
      comments: item.comments,
      // reply: item.replay,
      time: item.time,
      rating: item.rating,
      vendor
    }
  })
  const averageRating = Math.floor(aggregationResult[0].averageRating) == Math.round(aggregationResult[0].averageRating) 
                        ? Math.floor(aggregationResult[0].averageRating)
                        : Math.floor(aggregationResult[0].averageRating) + 0.5
    return {
      itemCode: aggregationResult[0]._id,
      averageRating,
      customerRatings
    }
  },

  saveShoppingCart: async (_, {resident, 
                              itemCode, 
                              vendor, 
                              description, 
                              quantity, 
                              rewardSilver, 
                              rate, 
                              promoRate,
                            taxRate}, {Vendor, pubsub}) => {

    const revisedResident= resident.replace(/\s/g, "")
    const  newResident = revisedResident.replace(/\./g, "")
    
    const MONGO_URI =
    process.env.MONGO_URI_PREFIX +
     newResident +
    process.env.MONGO_URI_SUFFIX;

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelShoppingCart = newResident + "_" + "ShoppingCart";
    const ShoppingCart = newConn.model(modelShoppingCart, ShoppingCartSchema);

    const savedItem = await ShoppingCart.findOne({itemCode})

    if (savedItem) {
      await ShoppingCart.findOneAndUpdate({ itemCode }, { $inc: { quantity } })
    } else {
      await new ShoppingCart({itemCode, 
                              vendor, 
                              description, 
                              quantity, 
                              rewardSilver, 
                              rate, 
                              promoRate, 
                              taxRate}).save()
    }
    const shoppingCart = await  ShoppingCart.findOne({itemCode}).populate({path: "vendor", model: Vendor}) 



  // const shoppingCartItems = shoppingCart.map(async (item) => {
    const vendorName = shoppingCart.vendor.businessTitle
    const newVendorName = vendorName.replace(/\s/g, "")
    const MONGO_URI_vendor =
      process.env.MONGO_URI_PREFIX +
      newVendorName +
      process.env.MONGO_URI_SUFFIX;
    // console.log(MONGO_URI)
    const newConn_vendor = await mongoose.createConnection(MONGO_URI_vendor, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName_vendor = newVendorName + "_" + "ItemCatalog";
    const ItemCatalog = newConn_vendor.model(modelName_vendor, ItemCatalogSchema);
    const catalogItem = await ItemCatalog.findOne({itemCode: shoppingCart.itemCode})
                                        //  .exec((err, itemCatalog) => {
                                        //    console.log(itemCatalog)
                                        //   })


    // console.log('catalogItem',catalogItem)

 return {
          itemCode: shoppingCart.itemCode,
          vendorName,
          vendorLogo: shoppingCart.vendor.logo,
          description: shoppingCart.description,
          quantity: shoppingCart.quantity,
          rewardSilver: shoppingCart.rewardSilver,
          photo: catalogItem.photo,
          rate: shoppingCart.rate,
          promoRate: shoppingCart.promoRate,
          taxRate: catalogItem.taxRate
        }
    
  // })

  // console.log(shoppingCartItems)
  // return shoppingCartItems
  },

  saveSketch: async (_, { input }, {}) => {
    if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
      const {
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
        businessTitle,
      } = input;
      // console.log(Date.now().toString());
      const vendor = businessTitle.replace(/\s/g, "")

      const MONGO_URI =
        process.env.MONGO_URI_PREFIX +
        vendor +
        process.env.MONGO_URI_SUFFIX;
      // console.log(MONGO_URI)
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      // .then(() => console.log(`MongoDB ${businessTitle} database is Connected`))
      // .catch((err) => console.error(err))
      // console.log(newConn)
      const modelName = vendor + "_" + "SavedSketch";
      const SavedSketch = newConn.model(modelName, SketchSchema);
      const pastSavedSketch = await SavedSketch.findOne({
        flyerId,
      });
      const sketchDocument = {
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
      };
      // console.log(pastSavedSketch);
      if (pastSavedSketch) {
        if (type == "FLYERCOUPON") {
          const revisedSketchPages = await SavedSketch.findOneAndUpdate(
            {
              flyerId,
            },
            {
              sketchPages,
              sketchPages_C,
              flyerTitle,
              backgroundColor,
              width,
              height,
              backgroundColor_C,
              width_C,
              height_C,
            },
            {
              new: true,
            }
          );
          // console.log(revisedSketchPages);
        } else {
          const revisedSketchPages = await SavedSketch.findOneAndUpdate(
            {
              flyerId,
            },
            {
              sketchPages,
              flyerTitle,
              backgroundColor,
              width,
              height,
            },
            {
              new: true,
            }
          );
          // console.log(revisedSketchPages);
        }
      } else {
        if (type == "FLYERCOUPON") {
          const newSavedSketch = await new SavedSketch({
            sketchPages,
            sketchPages_C,
            flyerId,
            flyerTitle,
            type,
            backgroundColor,
            width,
            height,
            backgroundColor_C,
            width_C,
            height_C,
          }).save();
        } else {
          const newSavedSketch = await new SavedSketch({
            sketchPages,
            flyerId,
            flyerTitle,
            type,
            backgroundColor,
            width,
            height,
          }).save();
        }
        // console.log(newSavedSketch);
      }
      const sketchList = await SavedSketch.find({});
      // if (sketchList.length > 0) {
      // console.log(sketchList)
      const returnedList = sketchList.map((listItem) => {
        return {
          flyerId: listItem.flyerId,
          flyerTitle: listItem.flyerTitle,
          type: listItem.type,
        };
      });
      return returnedList;
      // }
    } else {
      throw new Error(
        "This size of draft is over limit, please downsize photos or texts"
      );
    }
  },

  saveTemplate: async (_, { input }, {}) => {
    if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
      const {
        templatePages,
        templatePages_C,
        templateId,
        templateTagName,
        templateType,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
        businessTitle,
      } = input;
      // console.log('save template' + Date.now().toString());
      const vendor = businessTitle.replace(/\s/g, "")
      const MONGO_URI =
        process.env.MONGO_URI_PREFIX +
         vendor +
        process.env.MONGO_URI_SUFFIX;
      // console.log(MONGO_URI)
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelName = vendor + "_" + "SavedTemplate";
      const SavedTemplate = newConn.model(modelName, TemplateSchema);
      const pastSavedTemplate = await SavedTemplate.findOne({
        templateId,
      });
      // console.log(pastSavedTemplate);
      if (pastSavedTemplate) {
        const revisedTemplate = await SavedTemplate.findOneAndUpdate(
          {
            templateId,
          },
          {
            templatePages,
            templatePages_C,
            backgroundColor,
            width,
            height,
            backgroundColor_C,
            width_C,
            height_C,
          },
          {
            new: true,
          }
        );
        // console.log(revisedTemplate);
      } else {
        const newSavedTemplate = await new SavedTemplate({
          templatePages,
          templatePages_C,
          templateId,
          templateTagName,
          templateType,
          backgroundColor,
          width,
          height,
          backgroundColor_C,
          width_C,
          height_C,
        }).save();
        // console.log(newSavedSketch);
      }
      const templateList = await SavedTemplate.find({});
      // if (sketchList.length > 0) {
      // console.log(sketchList)
      const returnedList = templateList.map((listItem) => {
        return {
          templateId: listItem.templateId,
          templateTagName: listItem.templateTagName,
          templateType: listItem.templateType,
        };
      });
      return returnedList;
      // }
    } else {
      throw new Error(
        "This size of template is over limit, please downsize photos or texts"
      );
    }
  },

  saveItemCatalog: async (_, { input }, {}) => {
    const {  itemDetailed, businessTitle } = input;
    // console.log(input)
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
      vendor +
      process.env.MONGO_URI_SUFFIX;
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "ItemCatalog";
    const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
    await ItemCatalog.deleteMany({})

    for ( let item of itemDetailed) {
      // console.log(item)
      // const itemExist = await ItemCatalog.findOne({itemCode: item.itemCode})
      // if(itemExist) {
      //   await ItemCatalog.findOneAndUpdate(
      //                   {itemCode: item.itemCode},
      //                   {$set: {
      //                     subcategory: item.subcategory,
      //                     itemCode: item.itemCode,
      //                     description: item.description,
      //                     specification: item.specification,
      //                     unit: item.unit,
      //                     photo: item.photo,
      //                     rate: item.rate,
      //                     rewardSilver: item.rewardSilver,
      //                     promoRate: item.promoRate,
      //                     active: item.active,
      //                     taxRate: item.taxRate,
      //                     event: item.event
      //                   }}, [{ upsert: true }, { overwrite: true }]);
      // } else {
        await new ItemCatalog({
          subcategory: item.subcategory,
          itemCode: item.itemCode,
          description: item.description,
          specification: item.specification,
          unit: item.unit,
          photo: item.photo,
          rate: item.rate,
          rewardSilver: item.rewardSilver,
          promoRate: item.promoRate,
          taxRate: item.taxRate,
          event: item.event,
          active: item.active}).save()
      // }
     
    }

   
    // if (savedSubcategory) {
    //   const updatedSubcategory = await ItemCatalog.findOneAndUpdate(
    //     {
    //       subcategory,
    //     },
    //     {
    //       itemDetailed,
    //     },
    //     {
    //       new: true,
    //     }
    //   );

    //   if (updatedSubcategory)
    //     return {
    //       updated: true,
    //     };
    // } else {
    //   const newSubcategory = await new ItemCatalog({
    //     subcategory,
    //     itemDetailed,
    //   }).save();
    //   if (newSubcategory)
    //     return {
    //       updated: true,
    //     };
    // }
    const vendorCatalog = await ItemCatalog.find({})
    // console.log(vendorCatalog)
    return vendorCatalog
  },

  saveSubstituteItems: async (_, {vendor, dateFrom, dateTo, input}, { GameShopSubstitute }) => {
    await new GameShopSubstitute({ vendor, dateFrom, dateTo, substituteItems: input}).save()
    return { isSaved: true}
  },


  sendMessage: async (_, { sender, receiver, receiverType, time, text, fullName, title, guild }, { pubsub, Resident, Vendor}) => {
    if ( receiverType == 'resident' && guild != null) {
      await Resident.findOneAndUpdate({ residentName: receiver}, { $push: { guildMessages: {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false }}})
    } else if (receiverType == 'resident') {
      await Resident.findOneAndUpdate({ residentName: receiver}, { $push: { messages: {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false }}})
    } else {
      await Vendor.findOneAndUpdate({ businessTitle: receiver}, { $push: { messages: {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false  }}})
    }
    
    pubsub.publish('MESSAGE_RECEIVED',{messageReceived: {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false  }} )
    return {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false  }
  },

  sendWish: async (_, {  sender, wishKeywords, text,  fullName }, { pubsub, Vendor, Resident}) => {
   
    let wish = ' '
    wishKeywords.map(word => {
      wish = wish + ' ' + word
    })
    // wish = wish + text
    await Resident.findOneAndUpdate({residentName: sender}, {$set: {currentWish: wish}})

    let result = []
    for(let item of wishKeywords) {
      let search =  await Vendor.aggregate([
        { $match: {
          $text: { $search: item},
        }},
        { $group: {
          _id: "$businessTitle",
          vendor: {$first: "$businessTitle"},
        }
      }
      ])
     if (search) result = [...result, ...search]
    }
    // console.log('result',result)
    if(result.length>0) {

      for(let im of result) {
        await Vendor.findOneAndUpdate({businessTitle: im.vendor}, {$push: {messages: {sender, 
                                                                                    receiver: im.vendor, 
                                                                                    receiverType: 'vendor', 
                                                                                    time: Date.now().toString(), 
                                                                                    text, 
                                                                                    fullName, 
                                                                                    title: `(wish)`, 
                                                                                    guild: null, 
                                                                                    isRead: false  }}})
          pubsub.publish('MESSAGE_RECEIVED',{messageReceived: {sender, 
                                                                    receiver: im.vendor, 
                                                                    receiverType: 'vendor', 
                                                                    time: Date.now().toString(), 
                                                                    text, 
                                                                    fullName, 
                                                                    title: `(wish)`, 
                                                                    guild: null, 
                                                                    isRead: false }})

      }
    }

     
   
    return {sender, receiver: null, receiverType: 'vendor', time: Date.now().toString(), text, fullName, title:`(wish)`, guild: null, isRead: false  }
  },


  signupResident: async (
    _,
    { email, password, postalCode, firstName, lastName, initialLat, initialLng },
    { Resident, Pet, transporter }
  ) => {
    const indexE = email.indexOf("@");
    const indexD = email.indexOf(".");
    const residentName =
      email.slice(0, indexE) + email.slice(indexE + 1, indexD);
    const pet = await Pet.findOne({
      petName: "Dog_Jason",
    });
    // console.log(pet);
    const newResident = await new Resident({
      email,
      password,
      postalCode,
      firstName,
      lastName,
      residentName,
      initialLat,
      initialLng,
      pet: pet._id,
      location: { type: 'Point', coordinates: [initialLng, initialLat] }
    }).save();
    // console.log(email);
    // const token = createToken(newResident, process.env.SECRET, "2hr");
    const emailToken = email + "-Resident";
    const url = `http://localhost:4000/${emailToken}`;

    const handlebarOptions = {
      viewEngine: {
        extName: ".handlebars",
        partialsDir: "./views/",
        layoutsDir: "./views/",
        defaultLayout: "passVerification",
      },
      viewPath: "./views/",
      extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarOptions));
    transporter.use(
      "compile",
      inlineBase64({
        cidPrefix: "somePrefix_",
      })
    );

    // console.log(newResident.residentName);

    const mailOptions = {
      to: email,
      subject: "Confirm Email - don't reply ",
      template: "passVerification",
      context: {
        url,
        base64: LOGO_BASE64,
        name: firstName + ' ' + lastName,
        isResident: true
      },
    };

    transporter.sendMail(mailOptions, function(err, info) {
      if (err) console.log(err);
      else console.log(info);
    });

    return {
      // token,
      emailSent: true,
    };
  },

  signupVendor: async (
    _,
    {
      tagline,
      businessTitle,
      email,
      password,
      businessUnitNo,
      businessStreetNo,
      businessStreetName,
      businessCity,
      businessPostalCode,
      businessPhone,
      businessFax,
      businessEmail,
      businessHours,
      logo,
      photoList,
      businessCategory,
      aboutUs,
      website,
      deliveryFees,
      maxDeliveryDistance,
      lat,
      lng
    },
    { Vendor, transporter }
  ) => {
    // console.log(email);
    // const newVendor = 
    // console.log(businessPhotos);

   const newVendor = await new Vendor({
      tagline,
      businessTitle,
      email,
      password,
      businessUnitNo,
      businessStreetNo,
      businessStreetName,
      businessCity,
      businessPostalCode,
      businessPhone,
      businessFax,
      businessEmail,
      businessHours,
      logo,
      photoList,
      businessCategory,
      aboutUs,
      website,
      deliveryFees,
      maxDeliveryDistance,
      lat,
      lng
    }).save();
    // console.log(businessPhone);
    // console.log(newVendor)
    // const token = createToken(newResident, process.env.SECRET, "2hr");
    // const dir = `./public/${businessTitle}/`;
    // let updatedPicFiles = [];
    
    // if(!fs.existsSync(dir)) {
    //    fs.mkdirSync(dir, { recursive: true });
    // }
    // if (businessPhotos.length > 0) {
    //   businessPhotos.map(async (photo) => {
    //     const { createReadStream, filename, mimetype, encoding } = await photo;
    //     const stream = createReadStream();
    //     // const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    //     //   bucketName: businessTitle
    //     // })
    //     const newFilename =
    //       businessTitle + "-" + Date(Date.now()).toString() + "-" + filename;
    //     // const uploadStream = gridFSBucket.openUploadStream(newFilename, {
    //     //   chunkSizeBytes: 100000
    //     // })
    //     await new Promise((resolve, reject) => {
    //       stream
    //         .pipe(fs.createWriteStream(dir + newFilename))
    //         .on("error", reject)
    //         .on("finish", async () => {
    //           updatedPicFiles = fs.readdirSync(dir);
    //           // console.log(updatedPicFiles);
    //           await Vendor.findOneAndUpdate(
    //             { email },
    //             { $set: { photoList: updatedPicFiles } },
    //             { new: true }
    //           );
    //           resolve();
    //         });
    //     });

    //     // return {
    //     //   id: uploadStream.id,
    //     //   filename: newFilename,
    //     //   mimetype,
    //     //   encoding
    //     // }
    //   });

    //   // fs.readdir(dir, (err, files) => {
    //   //   if (err) throw err;
    //   //   console.log(files);
    //   //   updatedPicFiles = files;
    //   // });
    // }

    // console.log("updatedPicFiles" + updatedPicFiles);

    // console.log(businessPhone);
    const emailToken = email + "-Vendor";
    const url = `http://localhost:4000/${emailToken}`;

    const handlebarOptions = {
      viewEngine: {
        extName: ".handlebars",
        partialsDir: "./views/",
        layoutsDir: "./views/",
        defaultLayout: "passVerification",
      },
      viewPath: "./views/",
      extName: ".handlebars",
    };

    transporter.use("compile", hbs(handlebarOptions));
    transporter.use(
      "compile",
      inlineBase64({
        cidPrefix: "somePrefix_",
      })
    );

    // console.log(newResident.residentName)

    const mailOptions = {
      to: email,
      subject: "Confirm Email - don't reply ",
      // html: `<div>Please click this email to confirm your email: <a href="${url}"><button type="button">Confirm</button></a>
      //     <div>
      //       <p>This is the very good email</p>
      //       <img src="data:image/png;base64,${process.env.LOGO_BASE64}" width="30" height="30">
      //     </div>
      //     </div>`
      // attachments: [{
      //   filename: 'logo.png',
      //   path: '/cybertown/cybertown/src/assets/images/logo.png',
      //   cid: 'cybertownLogo'
      // }]
      template: "passVerification",
      context: {
        url,
        base64: LOGO_BASE64,
        name: newVendor.businessTitle,
        isResident: false
      },
    };

    transporter.sendMail(mailOptions, function(err, info) {
      if (err) console.log(err);
      else console.log(info);
    });

    return {
      // token,
      emailSent: true,
    };
  },


  signinResident: async (_, { email, password, fingerPrint }, { Resident }) => {
    const resident = await Resident.findOne({
      email,
    });
    // console.log(resident);
    if (!resident || !resident.emailVerified) {
      throw new Error("User not found / Email not verified ");
    } else {
      const isValidPassword = await bcrypt.compare(password, resident.password);
      if (!isValidPassword) {
        throw new Error("Invalid Password");
      }
      if (fingerPrint) {
        await Resident.findOneAndUpdate(
          {
            email,
          },
          {
            $set: {
              savedFingerPrint: fingerPrint,
            },
          }
        );
      }
     

      const token = fingerPrint
        ? createTokenWithFP(resident, process.env.SECRET)
        : createToken(resident, process.env.SECRET, "480h");
      // console.log(token);
      return {
        token,
        confirmed: resident.emailVerified,
      };
    }
  },

  signinVendor: async (_, { email, password, fingerPrint }, { Vendor }) => {
    const vendor = await Vendor.findOne({
      email,
    });
    // console.log(resident)
    if (!vendor || !vendor.emailVerified) {
      throw new Error("Vendor not found/Email verification not done yet");
    } else {
      const isValidPassword = await bcrypt.compare(password, vendor.password);
      if (!isValidPassword) {
        throw new Error("Invalid Password");
      }
      await Vendor.findOneAndUpdate(
        {
          email,
        },
        {
          $set: {
            savedFingerPrint: fingerPrint,
          },
        }
      );
      const token = fingerPrint
        ? createVendorTokenWithFP(vendor, process.env.SECRET)
        : createVendorToken(vendor, process.env.SECRET, "480h");
      // console.log(token)
      return {
        token,
        confirmed: vendor.emailVerified,
      };
    }
  },

  startGuild: async(_, { guildLeader, 
    guildLeaderAvatar, 
    guildLeaderNickName,
    guildFullName, 
    guildShortName, 
    guildLogo, 
    guildPost, 
    perk,
    contributionRatio,
    lat, 
    lng}, { Guild, Resident }) => {
   //Create a new guild

    const guild = await new Guild({
      guildLeader, 
      guildFullName, 
      guildShortName, 
      guildLogo, 
      guildPost,
      perk,
      contributionRatio,
      guildMembers: [{
                    name:guildLeader, 
                    nickName: guildLeaderNickName,
                    avatar: guildLeaderAvatar,
                    might: 0,
                    rank: 1,
                    lat,
                    lng,
                    lastRewardDate: ''
                }]
              }).save()

      // Create Guild Deals database
      // const MONGO_URI =
      //   process.env.MONGO_URI_PREFIX +
      //   guildFullName +
      //   process.env.MONGO_URI_SUFFIX;
      // // console.log(MONGO_URI)
      // const newConn = await mongoose.createConnection(MONGO_URI, {
      //   useNewUrlParser: true,
      //   useCreateIndex: true,
      //   useUnifiedTopology: true,
      //   useFindAndModify: false,
      // });
      // // .then(() => console.log(`MongoDB ${businessTitle} database is Connected`))
      // // .catch((err) => console.error(err))
      // // console.log(newConn)
      // const modelName = guildFullName + "_" + "GuildDealsStatus";
      // const GuildDealsStatus = newConn.model(modelName, GuildDealStatusSchema);

      //update resident
    await Resident.findOneAndUpdate({residentName: guildLeader}, {$set: { guildOwned: guild._id, guild: guild._id }})
    const guilds = await Guild.find({})
    // console.log(guilds)
    return {idAdded: guild._id, guilds}
  },

  stashFlyer: async(_, { residentName, vendor, flyerId,  flyerTitle, flyerType, dateFrom, dateTo, promoInfo, logo, targetDistribute }, { Resident, ActiveFlyer, pubsub }) => {
    // const residentInfo = await Resident.findOne({residentName})
    // const newStashdFlyer = residentInfo.stashedFlyers.push({vendor, flyerId})
      const newResident = await Resident.findOneAndUpdate(
        {residentName},
        {$push: { 
          stashedFlyers: {
            vendor, 
            flyerId, 
            flyerTitle, 
            flyerType, 
            dateFrom, 
            dateTo, 
            promoInfo: flyerType == "FLYER" ? " " : promoInfo, 
            logo,
            targetDistribute
          }},
          // $pull: { targetFlyers: { flyerId }}
        }, 
        { new: true }
      )
      // console.log(newResident)
      // await ActiveFlyer.findOneAndUpdate({ businessTitle: vendor}, { $pull: { vendorActiveFlyer : { flyerId }}})
      // const activeFlyers = await ActiveFlyer.find({})
      //  pubsub.publish("UPDATE_ACTIVE_FLYERS", { 
      //   updateActiveFlyers: activeFlyers,
      // });
      return newResident.stashedFlyers
  },

  stashMonsterChestItems: async (_, { playerName, vendor, promotionItemId, rewardItems }, { Vendor, Resident, Guild}) => {
    console.log(playerName)
    console.log(rewardItems[0].itemName)
    console.log(promotionItemId)
    console.log(vendor)
    // replace all ? with :
    const newFlyerId = promotionItemId.replace(/\?/g, ':')
    console.log(newFlyerId)

    //Get the matching vendor info
    const vendorInfo = await Vendor.findOne({businessTitle: vendor});

    //update resident's reward item quantity
    if(rewardItems[0].itemName == "silver") {
      const resident = await Resident
      .findOne(
        {residentName: playerName}).populate({path: "guild", model: Guild})
        console.log(resident)

      if(resident.guild) {
        await Guild.findOneAndUpdate({ guildFullName: resident.guild.guildFullName}, 
          { $inc: {guildSilver: Math.round(rewardItems[0].quantity * resident.guild.contributionRatio) }})
        }
         await Resident.findOneAndUpdate(
        { residentName: playerName}, { $inc: {silverCoins: 
          resident.guild   ? Math.round(rewardItems[0].quantity * (1 - resident.guild.contributionRatio))  : rewardItems[0].quantity
        }})
    }
     
    const newVendor = vendor.replace(/\s/g, "")

    //Get matching vendor saved flyers database
    const MONGO_URI =
    process.env.MONGO_URI_PREFIX +
    newVendor +
    process.env.MONGO_URI_SUFFIX;
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = newVendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);

    
    const vendorSavedFlyer = await SavedFlyer.findOne({
      flyerId: newFlyerId
    });
 
  if (vendorSavedFlyer){
    const { couponValue } = vendorSavedFlyer;
    
    if (couponValue.length > 0) {
      let promoInfo = " ";
      let cash = "Cash Discount";
      let per = "Percentage Discount";
      couponValue.map((item) => {
        if (item.valueType == "PERCENTAGE_DISCOUNT") {
          per = per + " " + item.amount * 100 + "%";
        } else {
          cash = item.valueType + " " + `$${item.amount}`;
        }
      });
      if (per.length > 19 && cash.length > 13) {
        promoInfo = per + " " + cash;
      } else {
        promoInfo = per.length > 19 ? per : cash;
      }
    await Resident.findOneAndUpdate(
      {residentName: playerName},
      {$push: { 
        stashedFlyers: {
          vendor: vendorInfo.businessTitle, 
          flyerId: vendorSavedFlyer.flyerId, 
          flyerTitle: vendorSavedFlyer.flyerTitle,
          flyerType:  vendorSavedFlyer.type,
          dateFrom: vendorSavedFlyer.dateFrom, 
          dateTo: vendorSavedFlyer.dateTo,
          promoInfo: vendorSavedFlyer.type == "FLYER" ? " " : promoInfo, 
          logo: vendorInfo.logo,
          targetDistribute: vendorSavedFlyer.targetDistribute
        }},
        // $pull: { targetFlyers: { flyerId }}
      }, 
      { new: true }
    )
    }
  }

    return { isStashed : true}
  },

  toggleGuildDealActive: async (_, {dealId, isActive}, {GuildDeal, pubsub}) => {
   const guildDealUpdated = await GuildDeal.findOneAndUpdate({_id: dealId}, {$set: {active: isActive}}, {new: true})

    pubsub.publish("UPDATE_GUILD_DEAL_ACTIVE ", {
        updateGuildDealActive: guildDealUpdated,
      });

    const guildDeals = await GuildDeal.find({})
    return guildDeals
  },

  transferGuildLeaderRemun: async(_, {resident, guild, amount}, {Guild, Resident}) => {
    await Guild.findOneAndUpdate({guildFullName: guild}, {$inc: {guildLeaderRemun: -amount}})
    await Resident.findOneAndUpdate({residentName: resident}, {$inc: {silverCoins: amount}})
    return {amount}
  },

  transferGuildLeadership: async(_, {leader, member, guildId}, {Guild, Resident}) => {
    await Guild.findOneAndUpdate({_id: guildId}, { $set: { guildLeader: member }})
    await Resident.findOneAndUpdate({ residentName: leader }, { $set: { guildOwned: null }})
    await Resident.findOneAndUpdate({ residentName: member }, { $set: { guildOwned: guildId }})
    return { isTransfered: true }
  },

  updateAvatar: async (_, { avatarUpdated, email }, { Resident }) => {
    const resident = await Resident.findOneAndUpdate(
      // Find post by postId and createdBy
      {
        email,
      },
      {
        $set: {
          avatarPic: avatarUpdated,
        },
      },
      {
        new: true,
      }
    );
    // console.log(resident.avatarPic)
    return {
      avatar: resident.avatarPic,
    };
  },

  updateGalleryFiles: async (_, { vendor, photoList }, { Vendor }) => {
    //  const dir = `./public/${vendor}/`;
    // if(fileToDelete) {
    // fs.unlinkSync(dir + fileToDelete)
    //  const vendorUpdated = await Vendor.findOneAndUpdate({businessTitle: vendor}, { $pull: { photoList: fileToDelete}}, {new: true})
    //  const fileList = vendorUpdated.photoList.map(item => {
    //     return { filename: item}
    //   })
     

    //   return fileList;
    // }

    // if(filesToAdd.length > 0) {
    //  const list = filesToAdd.map(async (photo) => {
    //     const { createReadStream, filename, mimetype, encoding } = await photo;
    //     const stream = createReadStream();
    //     // const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    //     //   bucketName: businessTitle
    //     // })
    //     const newFilename =
    //       vendor + "-" + Date(Date.now()).toString() + "-" + filename;
    //     // const uploadStream = gridFSBucket.openUploadStream(newFilename, {
    //     //   chunkSizeBytes: 100000
    //     // })
    //     await new Promise((resolve, reject) => {
    //       stream
    //         .pipe(fs.createWriteStream(dir + newFilename))
    //         .on("error", reject)
    //         .on("finish", async () => {
    //           updatedPicFiles = fs.readdirSync(dir);
    //           console.log(updatedPicFiles);
    //         await Vendor.findOneAndUpdate(
    //               { businessTitle: vendor },
    //               { $set: { photoList: updatedPicFiles } },
    //               { new: true }
    //             );
                
    //           resolve();
    //         });
    //     });
    //     // return {
    //     //   id: uploadStream.id,
    //     //   filename: newFilename,
    //     //   mimetype,
    //     //   encoding
    //     // }
    //     return {filename: newFilename }
    //   });

    //   const vendorUpdated = await Vendor.findOneAndUpdate({businessTitle: vendor})

    //   const fileList = vendorUpdated.photoList.map(item => {
    //     return { filename: item}
    //   })
     

    //   return [...fileList, ...list]
    // }
    const vendorUpdated = await Vendor.findOneAndUpdate({businessTitle: vendor}, {photoList})


    return {photoList: vendorUpdated.photoList}
  },

  updateProfile: async (
    _,
    {
      residentId,
      residentName,
      nickName,
      lastName,
      firstName,
      mailPostalCode,
      mailStrAddress,
      mailCity,
      gender,
      birthday,
      pet,
      postalCode,
      password,
      hobbies,
      favoriteFood,
      belief,
      initialLat,
      initialLng
    },
    { Resident, Pet, Guild }
  ) => {
    const newPassword = password;
    // console.log(password);
    const resident = await Resident.findOne({
      _id: residentId,
    });
    const petRec = await Pet.findOne({
      petName: pet,
    });
    // console.log(petRec);

    const salt = bcrypt.genSaltSync(10);
    // console.log(salt);

    const hash = bcrypt.hashSync(password, salt);
    // console.log(hash);
    // if (newPassword) {
    //   await bcrypt.genSalt(10, function (err, salt) {
    //     bcrypt.hash(newPassword, salt, function (err, hash) {
    //       // Store hash in your password DB.
    //       console.log(hash)
    //       Resident.findOneAndUpdate({
    //         _id: residentId
    //       }, {
    //         $set: {
    //           password: newPassword ? hash : resident.password,
    //         }
    //       }, {
    //         new: true
    //       })

    //     });
    //   });
    // }

    const currentResident = await Resident.findOne({_id: residentId}).select(["initialLat", "initialLng", "silverCoins"])
    const residentUpdated = await Resident.findOneAndUpdate(
      {
        _id: residentId,
      },
      {
        $set: {
          residentName,
          nickName,
          lastName,
          firstName,
          mailPostalCode,
          mailStrAddress,
          mailCity,
          gender,
          profileFilled: true,
          birthday: new Date(birthday),
          silverCoins: currentResident.silverCoins + 10000,
          pet: petRec._id,
          postalCode,
          hobbies,
          password: newPassword ? hash : resident.password,
          belief,
          favoriteFood,
          initialLat: initialLat ? initialLat : currentResident.initialLat,
          initialLng: initialLng ? initialLng : currentResident.initialLng,
          location: { type: 'Point', coordinates: [initialLng ? initialLng : currentResident.initialLng, initialLat ? initialLat : currentResident.initialLat ] }
        },
      },
      {
        new: true,
      }
    ).populate([{path: "pet",model: Pet}, {path: "guild", model: Guild}]);

    return residentUpdated;
  },


  updateMonsterChest: async (_, { 
    vendor,
    promotionItemTitle,
    promotionItemId,
    promotionType,
    rewardItems}, { MonsterChest , pubsub}) => {
      const monsterChestSaved = await new MonsterChest({
        vendor,
        promotionItemTitle,
        promotionItemId,
        promotionType,
        rewardItems
      }).save();

      pubsub.publish("MONSTER_CHEST_ADDED", {
        monsterChestAdded: monsterChestSaved,
      });

      if (monsterChestSaved) {
        return { saved: true}
      }
  },

  updatePetExpSilver: async (_, {residentName, petExperience, silverCoins, vendor, flyerId}, { Resident, Guild, pubsub, ActiveFlyer }) => {
    const residentRe = await Resident
      .findOne(
        {residentName}).populate({path: "guild", model: Guild})

      if(residentRe.guild) {
        await Guild.findOneAndUpdate({ guildFullName: residentRe.guild.guildFullName}, 
          { $inc: {guildSilver: Math.round(silverCoins * residentRe.guild.contributionRatio) }})
        }
    
    const resident = await Resident.findOneAndUpdate({ residentName }, 
      { $set: { petExperience, 
        silverCoins: residentRe.guild ? Math.round(silverCoins * ( 1 - residentRe.guild.contributionRatio)) : silverCoins
       }, $push: { flyersFedToPet: flyerId}}, {new: true})
     
    //  await ActiveFlyer.findOneAndUpdate({ businessTitle: vendor}, { $pull: { vendorActiveFlyer : {flyerId}}})
    // const activeFlyers = await ActiveFlyer.find({})
      //  pubsub.publish("UPDATE_ACTIVE_FLYERS", {
      //   updateActiveFlyers: activeFlyers,
      // });
      // console.log(activeFlyers)
    return {
      petExperience: resident.petExperience,
      silverCoins: resident.silverCoins,
      flyerId
    }
  },

  updatePetExpSilverStash: async (_, {residentName, petExperience, silverCoins, flyerId}, { Resident, Guild }) => {
    const residentRe = await Resident
    .findOne(
      {residentName}).populate({path: "guild", model: Guild})

    if(residentRe.guild) {
      await Guild.findOneAndUpdate({ guildFullName: residentRe.guild.guildFullName}, 
        { $inc: {guildSilver: Math.round(silverCoins * residentRe.guild.contributionRatio) }})
      }
   
    const resident = await Resident.findOneAndUpdate(
      { residentName }, 
      { $inc: { petExperience, 
        silverCoins: residentRe.guild ? Math.round(silverCoins * ( 1 - residentRe.guild.contributionRatio)) : silverCoins
      }, $pull: { stashedFlyers : {flyerId}}, $push: { flyersFedToPet: flyerId}}, 
      {new: true})

      // console.log(resident)
   
    return {
      petExperience: resident.petExperience,
      silverCoins: resident.silverCoins,
      flyerId,
      stashedFlyers: resident.stashedFlyers
    }
  },

  updateResidentSliver: async (_, {resident, silver}, {Resident, pubsub}) => {
    // console.log(silver)
    const residentDoc = await Resident.findOneAndUpdate({ residentName: resident}, { $inc: {silverCoins: -silver}}, { new: true})
    pubsub.publish("RESIDENT_SILVER_UPDATED", { residentSilverUpdated: {resident, silver: Math.floor(residentDoc.silverCoins)}})
    return { resident, silver: Math.floor(residentDoc.silverCoins)}
  },
  

  updateVendorProfile: async (
    _,
    {
      tagline,
      businessTitle,
      email,
      password,
      businessUnitNo,
      businessStreetNo,
      businessStreetName,
      businessCity,
      businessPostalCode,
      businessPhone,
      businessFax,
      businessHours,
      businessEmail,
      logo,
      businessCategory,
      aboutUs,
      website,
      deliveryFees,
      maxDeliveryDistance,
      photoList,
      crossBoundaryBusiness,
      lat,
      lng
    },
    { Vendor }
  ) => {
    // console.log(businessTitle);
    // console.log(photoList);
    const newPassword = password;
    // console.log(password);
    const vendor = await Vendor.findOne({
      email,
    });

    const salt = bcrypt.genSaltSync(10);
    // console.log(salt);

    const hash = bcrypt.hashSync(password, salt);
    //     const dir = `./public/${businessTitle}/`;
    //     console.log(dir)
    // let updatedPicFiles = [];

    // if (fs.existsSync(dir)) {
    //   // fs.readdir(dir, (err, files) => {
    //   //   const _ = require("lodash");
    //   //   console.log(files);
    //   //   if (err) throw err;
    //   //   if (files.length > 0) {
    //   //     for (const file of files) {
    //   //       const index = _.findIndex(photoList, (item) => {
    //   //         return item == file;
    //   //       });
    //   //       if (index < 0) {
    //   //         fs.unlink(path.join(dir, file), (err) => {
    //   //           if (err) throw err;
    //   //         });
    //   //       }
    //   //     }
    //   //   }
    //   // });
    //   const _ = require("lodash");
    //   const files = fs.readdirSync(dir);
    //   console.log("files" + files);
    //   if (files.length > 0 && photoList.length > 0) {
    //     for (const file of files) {
    //       const index = _.findIndex(photoList, (item) => {
    //         return item == file;
    //       });
    //       if (index < 0) {
    //         fs.unlinkSync(path.join(dir, file));
    //       }
    //     }
    //   }
    // } else {
    //   fs.mkdirSync(dir, { recursive: true });
    // }

    // if (businessPhotos.length > 0) {
    //   businessPhotos.map(async (photo) => {
    //     const { createReadStream, filename, mimetype, encoding } = await photo;
    //     const stream = createReadStream();
    //     // const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    //     //   bucketName: businessTitle
    //     // })
    //     const newFilename =
    //       businessTitle + "-" + Date(Date.now()).toString() + "-" + filename;
    //     // const uploadStream = gridFSBucket.openUploadStream(newFilename, {
    //     //   chunkSizeBytes: 100000
    //     // })
    //     await new Promise((resolve, reject) => {
    //       stream
    //         .pipe(fs.createWriteStream(dir + newFilename))
    //         .on("error", reject)
    //         .on("finish", async () => {
    //           updatedPicFiles = fs.readdirSync(dir);
    //           console.log(updatedPicFiles);
    //           await Vendor.findOneAndUpdate(
    //             { email },
    //             { $set: { photoList: updatedPicFiles } },
    //             { new: true }
    //           );
    //           resolve();
    //         });
    //     });
    //     // return {
    //     //   id: uploadStream.id,
    //     //   filename: newFilename,
    //     //   mimetype,
    //     //   encoding
    //     // }
    //   });
    //   const vendorUpdated = await Vendor.findOneAndUpdate(
    //     {
    //       email,
    //     },
    //     {
    //       $set: {
    //         tagline,
    //         businessTitle,
    //         email,
    //         businessUnitNo,
    //         businessStreetNo,
    //         businessStreetName,
    //         businessCity,
    //         businessPostalCode,
    //         businessPhone,
    //         businessFax,
    //         businessEmail,
    //         logo,
    //         businessCategory,
    //         aboutUs,
    //         website,
    //         password: newPassword ? hash : vendor.password,
    //       },
    //     },
    //     {
    //       new: true,
    //     }
    //   );
    //   return vendorUpdated;
    // } else {
    //   updatedPicFiles  = fs.readdirSync(dir);
    //   console.log(updatedPicFiles)

    const vendorUpdated = await Vendor.findOneAndUpdate(
      {
        email,
      },
      {
        $set: {
          tagline,
          businessTitle,
          email,
          businessUnitNo,
          businessStreetNo,
          businessStreetName,
          businessCity,
          businessPostalCode,
          businessPhone,
          businessFax,
          businessEmail,
          businessHours,
          logo,
          businessCategory,
          aboutUs,
          website,
          deliveryFees,
           maxDeliveryDistance,
          password: newPassword ? hash : vendor.password,
          photoList,
          crossBoundaryBusiness,
          lat,
          lng
        },
      },
      {
        new: true,
      }
    );

    return vendorUpdated;
    
  },

  updateSavedFlyer: async (_, { input }, {}) => {
    const {
      flyerId,
      dateFrom,
      dateTo,
      // quantityDistributed,
      couponValue,
      totalPages,
      businessTitle,
      setUp,
    } = input;
    // console.log(Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      process.env.MONGO_URI_PREFIX +
      vendor +
      process.env.MONGO_URI_SUFFIX;
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const pastSavedFlyer = await SavedFlyer.findOne({
      flyerId,
    });
    // console.log(pastSavedFlyer);
    if (pastSavedFlyer) {
      const updatedSavedFlyer = await SavedFlyer.findOneAndUpdate(
        {
          flyerId,
        },
        {
          dateFrom,
          dateTo,
          // quantityDistributed,
          couponValue,
          totalPages,
          setUp,
        },
        {
          new: true,
        }
      );

      // console.log(updatedSavedFlyer);
      return updatedSavedFlyer;
    } else {
      throw new Error("This flyer does not exist!");
    }
  },

  updateShoppingCart: async (_, {resident, itemCode, quantity}, {}) => {
    // console.log(resident)
    const revisedResident= resident.replace(/\s/g, "")
    const  newResident = revisedResident.replace(/\./g, "")

    const MONGO_URI =
    process.env.MONGO_URI_PREFIX +
     newResident +
    process.env.MONGO_URI_SUFFIX;

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelShoppingCart = newResident + "_" + "ShoppingCart";
    const ShoppingCart = newConn.model(modelShoppingCart, ShoppingCartSchema);

    if(itemCode == null) {
      await ShoppingCart.deleteMany({})
      return { itemCode, quantity}
    } else {
      if(quantity == 0) {
        await ShoppingCart.findOneAndRemove({ itemCode })
      } else {
        await ShoppingCart.findOneAndUpdate({ itemCode }, {  quantity  })
      }
    
    return { itemCode, quantity}
    }
  },

  updateStashedFlyers: async (_, { residentName, flyerId }, { Resident }) => {
    const resident = await Resident.findOneAndUpdate({ residentName }, { $pull: { stashedFlyers: { flyerId }}}, { new: true })
    return resident.stashedFlyers
  },
};
