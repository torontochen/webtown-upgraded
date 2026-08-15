const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const { tenantUri } = require("./tenantUri");
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
} = require("./Schema");
const EventCat = require("../models/EventCat");
const RewardItem = require("../models/RewardItem");

module.exports = {
  checkEmail: async (_, { email }, { Resident }) => {
    // console.log(email);
    const emailTrue = await Resident.findOne({
      email,
    });
    if (emailTrue) {
      return {
        emailVal: true,
      };
    }
    return {
      emailVal: false,
    };
  },

  checkGuildName: async (_, {guildName, nameType}, {Guild}) => {
    let guild
    if(nameType == 'fullName') {
       guild = await Guild.findOne({guildFullName: guildName})
    } else {
       guild = await Guild.findOne({guildShortName: guildName})
    }
    return guild ? { guildNameIsOk: false } : { guildNameIsOk: true }    
  },

  checkItemCode: async (_, {vendor, itemCode}, {}) => {
    const newVendor = vendor.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(newVendor);
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = newVendor + "_" + "ItemCatalog";
    const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
    const itemExist = await ItemCatalog.findOne({ itemCode });
    return { ok: itemExist ? true : false }
  },

  checkVendorEmail: async (_, { vendorEmail }, { Vendor }) => {
    // console.log(vendorEmail);
    const vendorEmailTrue = await Vendor.findOne({
      email: vendorEmail,
    });
    // console.log(vendorEmailTrue)
    if (vendorEmailTrue) {
      return {
        vendorEmailVal: true,
      };
    }
    return {
      vendorEmailVal: false,
    };
  },

  checkResidentName: async (_, { residentName, nickName }, { Resident }) => {
    // console.log(email);
    // let  residentNameTrue
    // if(nameType == "residentName") {
    //    residentNameTrue = await Resident.findOne({
    //   residentName
    // });
    // } else {
     const   residentNameTrue = await Resident.findOne({
      nickName
    });
    // }
    
    if (residentNameTrue && residentNameTrue.residentName !== residentName) {
      return {
        residentNameVal: true,
      };
    }
    return {
      residentNameVal: false,
    };
  },

  checkBusinessTitle: async (_, { businessTitle }, { Vendor }) => {
    // console.log(email);
    const businessTitleTrue = await Vendor.findOne({
      businessTitle,
    });
    if (businessTitleTrue) {
      return {
        businessTitleVal: true,
      };
    } else {
      return {
        businessTitleVal: false,
      };
    }
  },

  checkSavedFingerPrint: async (_, { fingerPrint }, { Resident, Vendor }) => {
    const resident = await Resident.findOne({
      savedFingerPrint: fingerPrint,
    });
    const vendor = await Vendor.findOne({
      savedFingerPrint: fingerPrint,
    });
    if (resident || vendor) {
      return { fingerPrintIsSaved: true };
    } else {
      return { fingerPrintIsSaved: false };
    }
  },

  getActiveFlyer: async (_, args, { ActiveFlyer }) => {

    await ActiveFlyer.updateMany(
      {},
      {
        $pull: {
          vendorActiveFlyer: {
            dateTo: {
              $lt: Date.now(),
            },
          },
        },
      }
    );
    const activeFlyer = await ActiveFlyer.find({});
    // console.log(activeFlyer)
    return activeFlyer;
  },

  getAIResponse: async (_, {prompt}, {openai}) => {

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: prompt,
    });
    console.log(chatCompletion.choices[0].message);
    return { message: chatCompletion.choices[0].message.content}
  },

   getAllItemsCatalog: async (_, { businessTitle }, {}) => {
     const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "ItemCatalog";
    const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
    const allItems = await ItemCatalog.find({});
    // console.log(allItems)
    if (allItems.length > 0) {
      // let allItemsCatalog = [];
      // allItems.map((item) => {
      //   item.itemDetailed.map((detail) => {
      //     allItemsCatalog.push(detail);
      //   });
      // });
      // console.log(allItemsCatalog)
      return allItems;
    } else {
      return [];
    }
  },

  getAllGuildDeals: async(_, {}, { GuildDeal }) => {
    const guilds = await GuildDeal.find({})
    return guilds
  },

  getCityHall: async(_, {}, { CityHall, Resident, Guild }) => {
    const rulingGuild = await Guild.findOne({isRulingGuild: true}) 
    const guildLeaderName = await Resident.findOne({ residentName: rulingGuild.guildLeader}).select("nickName")
    const  result = await Resident.aggregate([
      { $group: { 
                  _id: {}, 
                  might: {$sum: "$might"},
                  count: { $sum: 1 }
                }},

              ])
              // console.log('result',result)
     let cityhall = await CityHall.findOneAndUpdate({ metro: 'Great Toronto'}, 
     {$set: { 
       might: result[0].might, 
       population: result[0].count,
       governor: `[${rulingGuild.guildFullName}]${guildLeaderName.nickName}`
      }}, {new: true})
      // console.log('cityhall1',cityhall)
     if(cityhall) 
     {
       return cityhall
     } else {
      const  cityHall = await new CityHall({might: result[0].might, population: result[0].count}).save()
      // console.log('cityhall2',cityHall)

       return cityHall
     }
    
  },

  getCurrentResident: async (_, args, { Resident, currentUser}) => {
    // console.log("current user");
    // console.log(currentUser);
    if (currentUser && currentUser.tokenSign === "resident") {
      const resident = await Resident.findOne({
        residentName: currentUser.residentName,
      }).populate([{
        path: "pet",
        model: "Pet",
      }, 
      {path: "guild", model: "Guild"}]
      );
      // console.log(moment(resident.birthday).format("YYYY-MM-DD"))
      // resident.birthday = resident.birthday.getTime()
      // console.log(resident);
      return resident;
    } else {
      return null;
    }
  },

  getCurrentVendor: async (_, args, { Vendor, currentUser }) => {
    // console.log("job is done");
    // console.log(currentResident);
    if (currentUser && currentUser.tokenSign === "vendor") {
      const vendor = await Vendor.findOne({
        businessTitle: currentUser.businessTitle,
      });
      return vendor;
    } else {
      return null;
    }
  },

  getCustomerRatings: async (_, {vendor}, {Resident}) => {
    const newVendor = vendor.replace(/\s/g, "")

    const MONGO_URI =
    tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelNameRating = newVendor + "_" + "CustomerRating";
    const CustomerRating = newConn.model(modelNameRating, CustomerCommentSchema);
    // console.log(CustomerRating)
    // const customerRatings = await CustomerRating.find({})
   
    const vendorCustomerRatings = await CustomerRating.find({}).populate( { path: "residentId", model: Resident, select: ['residentName', 'avatarPic', 'nickName', 'firstName', 'lastName']})
    // const customerRatings  = await CustomerRating.find({})
    // console.log(customerRatings)

    // const customerRatingList = customerRatings.map(async(item) => {
    //     const resident = await Resident.findOne({_id: item.residentId})
        
    
    //         return {
    //           customerName: resident.residentName,
    //           customerAvatar: resident.avatarPic,
    //           rating: item.rating,
    //           comments: item.comments,
    //           time: item.time,
    //           vendor
    //         }
    //     })

    const customerRatings = vendorCustomerRatings.map(item => {
      return {
        resident: item.residentId.residentName,
        customerName: item.residentId.firstName + " " + item.residentId.lastName,
        customerAvatar: item.residentId.avatarPic,
        comments: item.comments,
        time: item.time,
        rating: item.rating,
        vendor
      }
    })
    // console.log("customerRatingList" ,customerRatings)
    return customerRatings
  },

  getGamePropList: async (_, {}, {GameProp}) => {
    const list = await GameProp.find({})

    // console.log(list)
    // console.log("prop list" + list)
    return list
  },

  getGameSubstituteList: async (_, {}, {GameSubstituteItem}) => {
    const list = await GameSubstituteItem.find({})
    // console.log(list)
    // console.log("substitute list" + list)
    return list
  },

  getGameShopSubstitute: async (_, {}, {GameShopSubstitute}) => {
    const itemList = await GameShopSubstitute.find({})
    return {
      shopItemCode: itemList[0].substituteItems[0].shopItemCode,
      shopItemName: itemList[0].substituteItems[0].shopItemName,
      substituteItemCode: itemList[0].substituteItems[0].substituteItemCode,
      substituteItemName: itemList[0].vendor + ' ' + itemList[0].substituteItems[0].substituteItemName,
      vendorItemCode: itemList[0].substituteItems[0].vendorItemCode,
      vendorItemPrice: itemList[0].substituteItems[0].vendorItemPrice,
      // bondCouponId: itemList[0].substituteItems[0].bondCouponId,
      vendor: itemList[0].vendor
    }
  },

  getGeoLocation: async (_, { residentName }, { Resident, Guild }) => {
    const resident = await Resident.findOne({ residentName }).populate({path: "guild", model: Guild, select: ['guildShortName']});
    // console.log("query geolocation");
    if (resident) {
      return {
        Lat: resident.initialLat,
        Lng: resident.initialLng,
        Username: resident.residentName,
        SilverInPocket: resident.silverCoins,
        Guild: resident.guild ? resident.guild.guildShortName : ' ',
        nickName: resident.nickName
      };
    }
  },

  getGuildLogos: async (_,{},{}) => {
    const dir = `./public/guildLogos/`;
    const logoFiles  = fs.readdirSync(dir);
    const logoFilesToSend = logoFiles.map(file => {
      return {logoString: file}
    })
    return logoFilesToSend
  },

  getGuildChatMessages: async (_, { guildFullName }, { Resident, Guild }) => {
    const newGuildFullName = guildFullName.replace(/\s/g, "")
    const MONGO_URI =
        tenantUri(newGuildFullName);
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelName = newGuildFullName + "_" + "GuildChat";
      const GuildChat = newConn.model(modelName, GuildChatSchema);
      const chatMessage =  await GuildChat.find({})
                                          .sort({ $natural: 1}).limit(100)
                                          .populate({path: 'residentId', model: Resident, select: ['residentName', 'avatarPic', 'guild']})
      // console.log('chatmessage', chatMessage)                                    
      const guildMembers = await Guild.findOne({ guildFullName }).select('guildMembers')

      let guildChatMessages = []
      chatMessage.map(message => {
        const index = guildMembers.guildMembers.findIndex(member => {
          // console.log(message.residentId.residentName)
          // console.log(member.name)
         return message.residentId.residentName == member.name
        })
        // console.log(message.message)
        if(index >= 0) {
          guildChatMessages.push({
            guildFullName,
            message: message.message,
            residentName: message.residentId.residentName,
            residentAvatar: message.residentId.avatarPic,
            rank: guildMembers.guildMembers[index].rank
          }) 
        }
      })
      // console.log(guildChatMessages)
      return guildChatMessages
  },

  getGuildDealsStatus: async(_, {guildFullName}, {GuildDeal}) => {

    // console.log(guildFullName)
    const newGuildFullName = guildFullName.replace(/\s/g, "")
    const MONGO_URI =
        tenantUri(newGuildFullName);
      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
      const modelName = newGuildFullName + "_" + "GuildDealsStatus";
      const GuildDealsStatus = newConn.model(modelName, GuildDealStatusSchema);
      const guildDealsStatus = await GuildDealsStatus.find({})
      

      let guildDealsStatusToReturn = []

      for( let item of guildDealsStatus) {
        const guildDeal = await GuildDeal.findOne({_id: item.guildDealId})

        if (guildDeal) {
            const status =  {
            specificItemList:guildDeal ? guildDeal.specificItemList : [],
            guildDealLevels: guildDeal ? guildDeal.guildDealLevels : [], 
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
          guildDealsStatusToReturn.push(status)
        }
       
      }
     
      // console.log(guildDealsStatusToReturn)
      return guildDealsStatusToReturn
  },
  

  getAllGuilds: async(_, {}, {Guild}) => {
    const guilds = await Guild.find({})
    // console.log(guilds)
    return guilds
  },


  getItemCatalog: async (_, { subcategory, businessTitle }, {}) => {
    const vendor = businessTitle.replace(/\s/g, "")
    // console.log('vendor in getItemCatalog', businessTitle)
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(subcategory)
    // console.log(businessTitle)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "ItemCatalog";
    const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
    if(subcategory) {
      const savedSubcategory = await ItemCatalog.find({
            subcategory
          });
          if (savedSubcategory)
          return savedSubcategory
    } else {
      const savedSubcategory = await ItemCatalog.find({});
      // console.log('savedSubcategory', savedSubcategory)
      if (savedSubcategory)
      return savedSubcategory
    }
    
    // console.log(savedSubcategory);
   
  },

  getMetroSpec: async (_, arg, { Resident }) => {
    const residentNumber = await Resident.aggregate([
      { $group: {
        _id: "$outsideBoundary",
        count: {
            $sum: 1
        }
      }
    }
    ])
    // console.log(residentNumber)
    let outsideBoundary = 0
    let insideBoundary = 0
    for(let item of residentNumber) {
      if(item._id == null) {
        // outsideBoundary = item.count
        insideBoundary = item.count

      } else {
        // insideBoundary = item.count
        outsideBoundary = item.count

      }
    }
    return { residentOutsideBoundary: outsideBoundary, 
            residentInsideBoundary: insideBoundary }
  },

  getMonsterChest: async (_, arg, { MonsterChest }) => {
    const monsterChestList = await MonsterChest.find({});
    // console.log(monsterChestList);
    return monsterChestList;
  },

  getNews: async (_, arg, {News}) => {
    const news = await News.find({})
    return news
  },

  getNewsPool: async (_, arg, {News, moment}) => {
    const news = await News.find({})

    const newsPool = news.map(item => {
      return {headline: `${item.newsTitle}: 
      ${item.headLine} 
      at ${moment(new Number(item.date)).format("MMMM Do YYYY, h:mm:ss a")}`}
    })

    return newsPool
  },

  getPets: async (_, args, { Pet }) => {
    const pets = await Pet.find({});
    // console.log(pets);
    return pets;
  },

  getProductRatings: async (_, { vendor }, {Resident} ) => {
    const newVendor = vendor.replace(/\s/g, "")
    const MONGO_URI =
    tenantUri(newVendor);

  const newConn = await mongoose.createConnection(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  const modelProductRating = newVendor + "_" + "ProductItemsRating";
  const VendorProductRating = newConn.model(modelProductRating, ProductRatingSchema);
 
     const vendorProductRatings = await VendorProductRating.find({}).populate( { path: "residentId", model: Resident, select: ['residentName', 'avatarPic', 'nickName', 'firstName', 'lastName']})
  const productRatings = vendorProductRatings.map(item => {
    return {
      resident: item.residentId.residentName,
      customerName: item.residentId.firstName + ' ' + item.residentId.lastName,
      customerAvatar: item.residentId.avatarPic,
      comments: item.comments,
      // reply: item.replay,
      time: item.time,
      rating: item.rating,
      itemCode: item.itemCode,
      vendor
    }
  })
   
  return productRatings
  },

  getPromotionEvents: async (_, {}, { PromotionEvent}) => {
    const eventList  = await PromotionEvent.find({}).populate({path: 'vendorId', model: 'Vendor'}) 
    // console.log(eventList)

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

    return promotionEvents
  },

  getEventCategory: async (_, args, { EventCat }) => {
    const promotionEvents = await EventCat.find({});
    // console.log(promotionEvents);
    const eventList = promotionEvents.map((item) => {
      return { eventName: item.eventName };
    });
    // console.log(eventList);
    return eventList;
  },

  getPickupAddress: async (_, {vendorName}, {Vendor}) => {
    // const pickupAddressList = vendorList.map( async (item) => {
       const vendor = await Vendor.findOne({businessTitle: vendorName})
       return {
         vendor: vendorName,
         address: vendor.businessStreetNo + ' ' 
         + vendor.businessStreetName 
         + ' ' + vendor.businessCity 
         + ' ' + vendor.businessState 
         + ' ' + vendor.businessPostalCode
       }
    // })

  },

  getProductCategory: async (_, args, { Bizcat_Products }) => {
    // console.log("signup vendor")
    const productsCategories = await Bizcat_Products.find({});
    return productsCategories;
  },

  getRewardItems: async (_, args, { RewardItem }) => {
    const rewardItems = await RewardItem.find({});
    // console.log(rewardItems);
    const itemList = rewardItems.map((item) => {
      return {
        itemName: item.itemName,
        icon: item.icon,
      };
    });

    return itemList;
  },

  getResidentOrders: async (_, {resident}, {}) => {
    const revisedResident= resident.replace(/\s/g, "")
    const  newResident = revisedResident.replace(/\./g, "")
    // console.log(newResident)
    const MONGO_URI =
      tenantUri(newResident);

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelResidentOrder = newResident + "_" + "ResidentOrder"
    const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)

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
                  tax: { $sum: '$tax' },
                  orderItems: {$first: '$orderItems'}
                  // NOTE: this was written as
                  //   {$first:'$orderItems'} ? {$first:'$orderItems'} : {$push:{...}}
                  // A JS ternary is evaluated when the pipeline object is built, not
                  // by MongoDB. The condition is a non-empty object literal, so it was
                  // always truthy and the $push branch was unreachable. Collapsed to the
                  // branch that actually ran — behaviour is identical. If the $push
                  // behaviour was ever intended, it needs $cond inside the pipeline.
                }}])
      // console.log(aggregationResult)
     return aggregationResult
  },

  getServiceCategory: async (_, args, { Bizcat_Services }) => {
    const servicesCategories = await Bizcat_Services.find({});
    // console.log(servicesCategories)
    return servicesCategories;
  },

  getRestaurantCategory: async (_, args, { Bizcat_Restaurants }) => {
    const restaurantCategories = await Bizcat_Restaurants.find({});
    // console.log(restaurantCategories)
    return {
      items: restaurantCategories[0].items,
    };
  },

  getResidentList: async(_, args, {Resident}) => {
    const list = await Resident.find({}).select(['residentName', 'firstName', 'lastName'])
    return list
  },

  getShoppingCart: async (_, {resident}, {Vendor}) => {

    const revisedResident= resident.replace(/\s/g, "")
    const  newResident = revisedResident.replace(/\./g, "")
    // console.log(newResident)

    const modelShoppingCart = newResident + "_" + "ShoppingCart";
    const MONGO_URI =
    tenantUri(newResident);

    // try {
    //   mongoose.connect(MONGO_URI, {
    //     useNewUrlParser: true,
    //     useCreateIndex: true,
    //     useUnifiedTopology: true,
    //     useFindAndModify: false,
    //     }, (conn) =>
    //     console.log("connected"));
    //     const ShoppingCart = conn.model(modelShoppingCart, ShoppingCartSchema);

    // } catch (error) {
    //   console.log("could not connect");

    // }

  const newConn = await mongoose.createConnection(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  console.log('create shoppingcart connection')
  
  const ShoppingCart = newConn.model(modelShoppingCart, ShoppingCartSchema);

  const shoppingCart = await  ShoppingCart.find({}).populate({path: "vendor", model: Vendor, select: ['businessTitle', 'logo', 'lat', 'lng', 'deliveryFees', 'maxDeliveryDistance']}) 
  // console.log('shoppingCart', shoppingCart)
  if(shoppingCart.length == 0) return []
  const vendorName = shoppingCart[0].vendor.businessTitle
  const logo = shoppingCart[0].vendor.logo
  const lat = shoppingCart[0].vendor.lat
  const lng = shoppingCart[0].vendor.lng
  const deliveryFees = shoppingCart[0].vendor.deliveryFees
  const maxDeliveryDistance = shoppingCart[0].vendor.maxDeliveryDistance

    const newVendorName = vendorName.replace(/\s/g, "")
    const MONGO_URI_vendor =
      tenantUri(newVendorName);
    // console.log(MONGO_URI)
    const newConn_vendor = await mongoose.createConnection(MONGO_URI_vendor, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = newVendorName + "_" + "ItemCatalog";
    const ItemCatalog = newConn_vendor.model(modelName, ItemCatalogSchema);
    // const catalogItem = await ItemCatalog.findOne({itemCode: item.itemCode})

  const shoppingCartItems = shoppingCart.map(async (item) => {
    // const vendorName = item.vendor.businessTitle
    // const newVendorName = vendorName.replace(/\s/g, "")
    // const MONGO_URI =
    //   process.env.MONGO_URI_PREFIX +
    //   newVendorName +
    //   process.env.MONGO_URI_SUFFIX;
    // // console.log(MONGO_URI)
    // const newConn = await mongoose.createConnection(MONGO_URI, {
    //   useNewUrlParser: true,
    //   useCreateIndex: true,
    //   useUnifiedTopology: true,
    //   useFindAndModify: false,
    // });
    // const modelName = newVendorName + "_" + "ItemCatalog";
    // const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
    const catalogItem = await ItemCatalog.findOne({itemCode: item.itemCode})
    // .exec((itemCatalog) => console.log(itemCatalog))
    // console.log(catalogItem)
    return {
      itemCode: item.itemCode,
      vendorName,
      vendorLogo: logo,
      vendorLat: lat,
      vendorLng: lng,
      deliveryFees,
      maxDeliveryDistance,
      description: item.description,
      quantity: item.quantity,
      rewardSilver: item.rewardSilver,
      photo: catalogItem.photo,
      rate: item.rate,
      promoRate: item.promoRate,
      taxRate: catalogItem.taxRate
    }
  })

  return shoppingCartItems
  },

  getSketchList: async (_, { businessTitle }, {}) => {
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedSketch";
    const SavedSketch = newConn.model(modelName, SketchSchema);
    const sketchList = await SavedSketch.find({});
    if (sketchList.length > 0) {
      const returnedList = sketchList.map((listItem) => {
        return {
          flyerId: listItem.flyerId,
          flyerTitle: listItem.flyerTitle,
          type: listItem.type,
        };
      });
      return returnedList;
    }
  },

  getFlyerList: async (_, { businessTitle }, {}) => {
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const flyerList = await SavedFlyer.find({});
    if (flyerList.length > 0) {
      const returnedList = flyerList.map((listItem) => {
        return {
          flyerId: listItem.flyerId,
          flyerTitle: listItem.flyerTitle,
          type: listItem.type,
          setUp: listItem.setUp,
          distributed: listItem.distributed,
          crossBoundary: listItem.crossBoundary,
          targetDistribute: listItem.targetDistribute
        };
      });
      return returnedList;
    }
  },

  getTemplateList: async (_, { businessTitle }, {}) => {
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedTemplate";
    const SavedTemplate = newConn.model(modelName, TemplateSchema);
    const templateList = await SavedTemplate.find({});
    if (templateList.length > 0) {
      const returnedList = templateList.map((listItem) => {
        return {
          templateId: listItem.templateId,
          templateTagName: listItem.templateTagName,
          templateType: listItem.templateType,
        };
      });
      return returnedList;
    }
  },

  getSelectedFlyerClientView: async (
    _,
    { flyerId, businessTitle, time, resident },
    {Resident}
  ) => {
    // console.log('select template' + Date.now().toString());
    // console.log('resident', resident)
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    // console.log(flyerId)

   
    const residentInfo = await Resident.findOneAndUpdate({residentName: resident}, {$addToSet: { flyersRead: flyerId}}, {new: true})
  //  console.log('usedCoupons', residentInfo.usedCoupons)
    const selectedFlyer = await SavedFlyer.findOneAndUpdate({
      flyerId,
    }, {$inc: { quantityRead: 1}});
    // console.log("selected flyer 957", selectedFlyer);
    if (selectedFlyer) {
      const {
        couponPages,
        flyerPage_C,
        width,
        height,
        width_C,
        height_C,
        type,
        flyerTitle,
        vendor,
        couponValue,
        flyerId
      } = selectedFlyer;
      // console.log('couponValue', couponValue)
      const previewArray =
        flyerPage_C.length > 0 ? [...flyerPage_C, ...couponPages] : couponPages;
      const browser = await puppeteer.launch();
      let pageView = [];
      // console.log('previewArray', previewArray)
      // console.log('previewArray length', previewArray.length)
      for (let i = 0; i < previewArray.length; i++) {
        const couponType = (type== 'FLYER' || type == 'FLYERCOUPON') && i < flyerPage_C.length ? 'FLYERPAGE' : 'COUPONPAGE'
        if(couponType == 'COUPONPAGE') {
          if(type == 'FLYERCOUPON') {
            const index = residentInfo.usedCoupons.findIndex(item => couponValue[i-1].couponId == item.couponId && flyerId == item.flyerId)
            if (index >= 0 && couponValue[i-1].oneTimeUsage) { continue }
          } else {
            // console.log('couponId',couponValue[i].couponId)
            const index = residentInfo.usedCoupons.findIndex(item => couponValue[i].couponId == item.couponId && flyerId == item.flyerId)
            // console.log('index', index)
            if (index >= 0 && couponValue[i].oneTimeUsage) { 

              continue }
          }
        }
        const page = await browser.newPage();
        // console.log('page',page)
        const viewPortWidth = flyerPage_C.length > 0 && i <= flyerPage_C.length - 1
                          ? width_C + 150
                          : width + 150
        const viewPortHeight =   flyerPage_C.length > 0 && i <= flyerPage_C.length - 1
                          ? height_C + 150
                          : height + 150             
        await page.setViewport({
                  width: viewPortWidth,
                  height: viewPortHeight,
                  deviceScaleFactor: 2
                });
        // console.log(previewArray[i].previewString)

        await page.setContent( previewArray[i].previewString );

        const base64 = await page.screenshot({
          encoding: "base64",
          // omitBackground: true,
          quality: 100,
          type: "jpeg",
          clip: {
            x: 0,
            y: 0,
            width: viewPortWidth,
            height: viewPortHeight
          },
        });
        // console.log(base64)
        pageView.push({
          vendor,
          flyerId: flyerId,
          couponId: previewArray[i].id,
          base64,
          width:
            flyerPage_C.length > 0 && i <= flyerPage_C.length - 1
              ? width_C
              : width,
          height:
            flyerPage_C.length > 0 && i <= flyerPage_C.length - 1
              ? height_C
              : height,
          flyerType: type,
          couponType,
          flyerTitle,
          couponTitle: couponType == 'COUPONPAGE' && type == 'FLYERCOUPON' ? couponValue[i - 1].couponTitle : couponType == 'COUPONPAGE' ? couponValue[i].couponTitle : ''
        });
      }
      await browser.close();
      return pageView
    }
  },

  getSelectedTemplate: async (_, { templateId, businessTitle, time }, {}) => {
    // console.log('select template' + Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedTemplate";
    const SavedTemplate = newConn.model(modelName, TemplateSchema);
    const selectedTemplate = await SavedTemplate.findOne({
      templateId,
    });
    // console.log(selectedTemplate);
    if (selectedTemplate) {
      return {
        _id: selectedTemplate._id,
        sketchPages: selectedTemplate.templatePages,
        sketchPages_C: selectedTemplate.templatePages_C,
        flyerId: selectedTemplate.templateId,
        flyerTitle: selectedTemplate.templateTagName,
        type: selectedTemplate.templateType,
        backgroundColor: selectedTemplate.backgroundColor,
        backgroundColor_C: selectedTemplate.backgroundColor_C,
        width: selectedTemplate.width,
        height: selectedTemplate.height,
        width_C: selectedTemplate.width_C,
        height_C: selectedTemplate.height_C,
        origin: "template",
      };
    }
  },

  getSelectedSketch: async (_, { flyerId, businessTitle, time }, {}) => {
    // console.log(Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedSketch";
    const SavedSketch = newConn.model(modelName, SketchSchema);
    const selectedSketch = await SavedSketch.findOne({
      flyerId,
    });
    // console.log(selectedSketch);
    if (selectedSketch) {
      return {
        _id: selectedSketch._id,
        sketchPages: selectedSketch.sketchPages,
        sketchPages_C: selectedSketch.sketchPages_C,
        flyerId: selectedSketch.flyerId,
        flyerTitle: selectedSketch.flyerTitle,
        type: selectedSketch.type,
        backgroundColor: selectedSketch.backgroundColor,
        width: selectedSketch.width,
        height: selectedSketch.height,
        backgroundColor_C: selectedSketch.backgroundColor_C,
        width_C: selectedSketch.width_C,
        height_C: selectedSketch.height_C,
        origin: "sketch",
      };
    }
  },

  getSingleItemRating: async (_, {vendor, itemCode}, {Resident}) => {
    const newVendor = vendor.replace(/\s/g, "")
      const MONGO_URI =
      tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelProductRating = newVendor + "_" + "ProductItemsRating";
    const VendorProductRating = newConn.model(modelProductRating, ProductRatingSchema);
    const  aggregationResult = await VendorProductRating.aggregate([
                                  { $match : {itemCode}},
                                  { $group: { _id: '$itemCode', averageRating: { $avg: "$rating" }}}])
    // console.log(aggregationResult)
    if(aggregationResult.length > 0) {
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
      return {
        itemCode: aggregationResult[0]._id,
        averageRating: aggregationResult[0].averageRating,
        customerRatings
      }
    }
   
  },


  getSingleCoupon: async(_, {vendor, flyerId, couponId}, {}) => {
    const newVendor = vendor.replace(/\s/g, "")
    const MONGO_URI =
    tenantUri(newVendor);
  // console.log(MONGO_URI)
  const newConn = await mongoose.createConnection(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  const modelName = newVendor + "_" + "SavedFlyer";
  const SavedFlyer = newConn.model(modelName, FlyerSchema);
  const singleCoupon = await SavedFlyer.findOne({flyerId, couponValue:{$elemMatch: { couponId }}}).select(['couponValue'])
  // console.log('singleCoupon', singleCoupon)
  return {valueType: singleCoupon.couponValue[0].valueType,
    amount: singleCoupon.couponValue[0].amount,
    couponId: singleCoupon.couponValue[0].couponId,
    couponTitle: singleCoupon.couponValue[0].couponTitle,
    oneTimeUsage: singleCoupon.couponValue[0].oneTimeUsage,
    minimalAmount: singleCoupon.couponValue[0].minimalAmount,
    minimalQty: singleCoupon.couponValue[0].minimalQty,
    isForAllItems: singleCoupon.couponValue[0].isForAllItems,
    itemsBound: [...singleCoupon.couponValue[0].itemsBound] }
  },

  getTargetDistributeResident: async(_, 
    { age, 
      gender, 
      religion, 
      hobbies, 
      favoriteFood, 
      regions, 
      distance, 
      wishChecked,
      wishList,
      vendorLat,
      vendorLng}, {Resident}) => {

// console.log(regions)
        const dateOfBirth = (age) => {
          // console.log(age)
          const ageInMillis = age *  365 * 24 * 60 * 60 * 1000; 
          // console.log(new Date(new Date().getTime() - ageInMillis))

          return new Date(new Date().getTime() - ageInMillis)
        }
        let number1 = []
        let  number2 = []

        if ( wishChecked ) {
          number1 = await Resident.aggregate([
            { $match: {
              $text: { $search: wishList},
            }},
            { $match: {
              $and: [
                { birthday:  age ? { $lte: dateOfBirth(age[0]), $gte: dateOfBirth(age[1])} : { $lt: dateOfBirth(0)}},
                { belief: religion ? religion : { $not: { $eq: religion}}},
                { gender: gender ? gender: { $not: { $eq: gender }} },
                { mailCity : regions ? { $in: regions } : { $not: { $in: []}}},
                { location : { $geoWithin: { $centerSphere: [ [vendorLng , vendorLat], distance ? distance  / 6378.1 : 1000] } }}
              ]
            }},
            { $group: {
              _id: "$residentName",
              lat: {$first: "$initialLat"},
              lng: {$first: "$initialLng"},
              count: {
                  $sum: 1
              }
            }
          }
          ])
        } 

          // console.log(distance   ? distance / 6378.1  : 1000 / 6378.1)
          number2 = await Resident.aggregate([
            { $match: 
              {
              $and: [
                { birthday:  age ? { $lte: dateOfBirth(age[0]), $gte: dateOfBirth(age[1])} : { $lt: dateOfBirth(0)}},
                { belief: religion ? religion : { $not: { $eq: religion}}},
                { gender: gender ? gender: { $not: { $eq: gender }} },
                // { $or: [
                { hobbies: hobbies ? { $in: hobbies } : { $not: { $in: []}}},
                { favoriteFood: favoriteFood ? { $in: favoriteFood } : { $not: { $in: []}}},
                // ]},
                { mailCity : regions ? { $in: regions } : { $not: { $in: []}}},
                { location : { $geoWithin: { $centerSphere: [ [vendorLng , vendorLat], distance ? distance  / 6378.1 : 1000] } }},
              ]
            }
          },
            { $group: {
              _id: "$residentName",
              lat: {$first: "$initialLat"},
              lng: {$first: "$initialLng"},
              count: {
                  $sum: 1
              }
            }
          }
          ])

          // number2 = await Resident.find({location :  {
          //   $near: {
          //     $geometry: {
          //        type: "Point" ,
          //        coordinates: [ vendorLng , vendorLat ]
          //     },
          //     $maxDistance: distance * 1000,
          //   }
          // }})

    // console.log(number1)
    // console.log(number2)
    let count = 0
    let locations
    let residentList = []

    if(number2.length > 0) {
       locations = number2.map(item2 => {
        residentList.push(item2._id)
        count = count + item2.count
        return { lat: item2.lat, lng: item2.lng }
      
    })
    }


    // if(number1.length > 0) {
    //    number1.map(item1 => {
    //   const index = _.findIndex(number2, item2 => {
    //     return item1._id == item2._id
    //   })
    //   if(index < 0) {
    //     count = count + item1.count
    //     locations.push({lat: item1.lat, lng: item1.lng})
    //   }
    // })
    // }

  //  console.log(locations)
  //  console.log(count)
    
    return { number: count, locations, residentList}
  },

  // getVendorCustomerRatings: async(_, {vendor},{}) => {
  //   const newVendor = vendor.replace(/\s/g, "")
  //   // console.log('newVendor', newVendor)

  //   const MONGO_URI =
  //   process.env.MONGO_URI_PREFIX +
  //   newVendor  +
  //   process.env.MONGO_URI_SUFFIX;

  //   const newConn = await mongoose.createConnection(MONGO_URI, {
  //     useNewUrlParser: true,
  //     useCreateIndex: true,
  //     useUnifiedTopology: true,
  //     useFindAndModify: false,
  //   });
  //   const modelNameRating = newVendor + "_" + "CustomerRating";
  //   const CustomerRating = newConn.model(modelNameRating, CustomerCommentSchema);
  //   // console.log(CustomerRating)
  //   const customerRatings = await CustomerRating.find({})
  //   // console.log(customerRatings)
  //   const customerRatingList = customerRatings.map(async(item) => {
  //   const resident = await Resident.findOne({_id: item.residentId})
    

  //       return {
  //         customerName: resident.residentName,
  //         customerAvatar: resident.avatarPic,
  //         rating: item.rating,
  //         comments: item.comments,
  //         time: item.time,
  //         vendor
  //       }
  //   })

  //   return customerRatingList

  // },
  getVendorCheckoutInfos: async(_, { vendor}, {Vendor}) => {
    const vendorInfo = await Vendor.findOne({ businessTitle: vendor }).select(['lat', 'lng', 'deliveryFees', 'maxDeliveryDistance'])
    // console.log(vendorInfo)
    return {
      lat: vendorInfo.lat,
      lng: vendorInfo.lng,
      deliveryFees: vendorInfo.deliveryFees,
      maxDeliveryDistance: vendorInfo.maxDeliveryDistance
    }
  },

  getVendorFlyers: async(_, {vendor}, {}) => {
    const newVendor = vendor.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(newVendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = newVendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema)
    const vendorFlyers = await SavedFlyer.find({})
    return vendorFlyers
  },

  getVendorGuildDeals: async (_, {vendor}, {GuildDeal}) => {
    const guildDeals = await GuildDeal.find({vendor})
    // console.log('guildDeals', guildDeals)
    return guildDeals
  },

  getVendorList: async(_, {}, {Vendor}) => {
    const vendor = await Vendor.find({}).select("businessTitle")
    const list = vendor.map(item => {
     return {vendor: item.businessTitle}
    })
    return list
  },

  getVendorOrders: async (_, {vendor}, {}) => {
    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI =
      tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelVendorOrder = newVendor + "_" + "VendorOrder"
    const VendorOrder = newConn.model(modelVendorOrder, VendorOrderSchema)

    const  aggregationResult = await VendorOrder.aggregate([
      { $group: { _id: '$orderNo', 
                  orderNo: { $first: '$orderNo'},
                  date: { $first: '$date'},
                  resident: { $first: '$resident' },
                  vendor: { $first: '$vendor' },
                  deliveryType: { $first: '$deliveryType' },
                  customerName: { $first: '$customerName'},
                  deliveryAddress: { $first: '$deliveryAddress' },
                  pickupAddress: { $first: '$pickupAddress' },
                  totalDiscount: { $first: '$totalDiscount'},
                  shipping: { $first: '$shipping'},
                  totalAmount: { $sum: { $multiply: [ "$unitPrice", "$quantity" ] } },
                  paymentMethod: { $first: '$paymentMethod'},
                  dealsTitle: {$first: '$dealsTitle'},
                  note:{$first: '$note'},
                  isUnderDispute: {$first: '$isUnderDispute'},
                  isCanceled: {$first: '$isCanceled'},
                  isConfirmed: {$first: '$isConfirmed'},
                  disputeInfo: {$first: '$disputeInfo'},
                  isFulfilled: {$first: '$isFulfilled'},
                  fulfillNote: {$first: '$fulfillNote'},
                  tax: { $sum: '$tax' },
                  orderItems: { $push: {
                    description: '$description',
                    quantity: '$quantity',
                    unitPrice: '$unitPrice',
                    taxRate: '$taxRate',
                    itemCode: '$itemCode',
                    
                  }}
                }}])
      // console.log(aggregationResult)
     return aggregationResult
  },

  getVendorSalesInfo: async(_, {vendor}, {}) => {
    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI =
      tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelVendorOrder = newVendor + "_" + "VendorOrder"
    const VendorOrder = newConn.model(modelVendorOrder, VendorOrderSchema)
    const now = Date.now()
    const dateOfMonth = new Date(now).getDate()
    
    const month = new Date(now).getMonth()
// console.log('month', month)
    
    let yearToDate = []

    let monthToDate = []
    for(let j= 1; j <= month + 1; j++){
      
      let salesYear = 0
      let ordersYear = 0
      let salesMonth = 0
      let ordersMonth = 0
      let toDateOfMonth = (j == month + 1) ? dateOfMonth  : 31
      for(let i= 1; i <= toDateOfMonth; i++){
        const  result = await VendorOrder.aggregate([
          { $match: { $and:[{$expr: { $eq: [{ $dayOfMonth: {date: "$date", timezone: "America/Chicago"}}, i]}}, {$expr: { $eq: [{ $month: "$date"}, j]}}]}},
          { $group: { _id: '$orderNo', 
                      totalDiscount: { $first: '$totalDiscount'},
                      sales: { $sum: { $multiply: [ "$unitPrice", "$quantity" ] } },
                      orders:{ $count:{}}
                    }},
          // { $group: { _id: '$_id', 
          //             totalDiscount: {$sum: "$totalDiscount"},
          //             sales: {$sum: "$sales"},
          //             orders: { $count:{}}
          //           }},

                  ])

          // console.log('result' + result)        
          
          if(result.length>0){

            for (let item of result) {
          // console.log('item' + item)        

              salesMonth += (item.sales - item.totalDiscount)
              ordersMonth += item.orders
              
            }
            if( j == month + 1) {
              // console.log('result', result)
              monthToDate.push({sales: salesMonth, orders: ordersMonth})
            }
          salesYear += salesMonth 
          ordersYear += ordersMonth
          } else {
            if( j == month + 1) {
              monthToDate.push({sales: 0, orders: 0})
            }
            
            salesYear += 0
            ordersYear += 0
          }
         

      }
      ordersMonth = 0
      salesMonth = 0
      yearToDate.push({ sales: salesYear, orders: ordersYear })
    }
    // console.log('dailySales', monthToDate[dateOfMonth -1 ])
    // console.log('dailySales', monthToDate)
    // console.log('yearToDate', yearToDate)

    return { dailySales: monthToDate[dateOfMonth -1 ],
            monthToDateSales: monthToDate,
            yearToDateSales: yearToDate
          }
  },

  getVendorSearchResult: async(_, {searchItems}, {Vendor}) => {
    let searchResult = []

    for(let item of searchItems) {
      let search =  await Vendor.aggregate([
        { $match: {
          $text: { $search: item},
        }},
        { $group: {
          _id: "$businessTitle",
          vendorStreetNo: {$first: "$businessStreetNo"},
          vendorStreetName: {$first: "$businessStreetName"},
          vendorCity: {$first: "$businessCity"},
          vendorState: {$first: "$businessState"},
          vendorCountry: {$first: "$businessCountry"},
          vendorPhone: {$first: "$businessPhone"},
          vendorEmail: {$first: "$businessEmail"},
          vendorRating: {$first: "$rating"},
          vendorLogo: {$first: "$logo"},
          vendor: {$first: "$businessTitle"},
          vendorCategory: {$first: "$businessCategory"},
          lat: { $first: "$lat"},
          lng: { $first: "$lng"}
        }
      }
      ])
      for(let im of search) {
        const index = searchResult.findIndex(item => item._id == im._id)
        if(index < 0){
          searchResult.push(im)
        }
      }
    }
    // console.log(searchResult)
   
    return searchResult
  },

  getVendorSettlementRecords: async(_, {vendor}, {}) => {
    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI =
      tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelVendorSettlement = newVendor + "_" + "VendorSettlement"
    const VendorSettlement = newConn.model(modelVendorSettlement, VendorSettlementSchema)
    const vendorSettlementRecords = await VendorSettlement.find({})
    // console.log(vendorSettlementRecords)
    return vendorSettlementRecords
  },

  getVendorPromotionEvents: async(_, {vendor},{}) => {
        const newVendor = vendor.replace(/\s/g, "")
       const MONGO_URI =
        tenantUri(newVendor);

      const newConn = await mongoose.createConnection(MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });

      const modelNameEvent = newVendor + "_" + "PromotionEvent";
      const VendorPromotionEvent = newConn.model(modelNameEvent, VendorPromotionEventSchema);
      const  vendorPromotionEvents = await VendorPromotionEvent.find({})

    return vendorPromotionEvents
  },

  getVendorInterface: async(_, {vendor}, {Vendor, Resident}) => {
    // console.log('Vendor', vendor)
    await Vendor.findOneAndUpdate({businessTitle: vendor}, {$inc: { homePageVisit: 1}})

    const newVendor = vendor.replace(/\s/g, "")
    // console.log('newVendor', newVendor)

    const MONGO_URI =
    tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const modelNameEvent =  newVendor + "_" + "PromotionEvent";
    const VendorPromotionEvent = newConn.model(modelNameEvent, VendorPromotionEventSchema);
    const  vendorPromotionEvents = await VendorPromotionEvent.find({})

    const modelNameCatalog = newVendor + "_" + "ItemCatalog";
    const ItemCatalog = newConn.model(modelNameCatalog, ItemCatalogSchema);
    const itemsCatalog = await ItemCatalog.find({});
    // console.log('itemscatalog', itemsCatalog)

    const modelNameRating = newVendor + "_" + "CustomerRating";
    const CustomerRating = newConn.model(modelNameRating, CustomerCommentSchema);
    // console.log(CustomerRating)
    const customerRatings = await CustomerRating.find({})
    // console.log(customerRatings)
    const customerRatingList = customerRatings.map(async(item) => {
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


    const vendorDetails = await Vendor.findOne({businessTitle: vendor})

    // let itemsCatalog = []
    // for (let item of itemCatalog) {
    //   itemsCatalog = [...itemsCatalog, ...item.itemDetailed]
    // }
    return {
      _id: vendorDetails._id,
      tagline: vendorDetails.tagline,
      businessTitle: vendorDetails.businessTitle,
      businessUnitNo: vendorDetails.businessUnitNo,
      businessStreetNo: vendorDetails.businessStreetNo,
      businessStreetName: vendorDetails.businessStreetName,
      businessCity: vendorDetails.businessCity,
      businessState: vendorDetails.businessState,
      businessCountry: vendorDetails.businessCountry,
      businessPostalCode: vendorDetails.businessPostalCode,
      businessPhone: vendorDetails.businessPhone,
      businessHours: vendorDetails.businessHours,
      businessFax: vendorDetails.businessFax,
      businessEmail: vendorDetails.businessEmail,
      logo: vendorDetails.logo,
      businessCategory: vendorDetails.businessCategory,
      aboutUs: vendorDetails.aboutUs,
      website: vendorDetails.website,
      lat: vendorDetails.lat,
      lng: vendorDetails.lng,
      deliveryFees: vendorDetails.deliveryFees,
      maxDeliveryDistance: vendorDetails.maxDeliveryDistance,
      photoList: vendorDetails.photoList,
      vendorPromotionEvents,
      itemCatalog: itemsCatalog,
      customerRatings: customerRatingList
    }
  },

  searchAvailableDeals: async(_, { input }, {Resident,  ActiveFlyer}) => {
    const { vendor, resident, orderItems, time } = input
    // console.log('input', input)
    // console.log('orderItems', orderItems)
    const newVendor = vendor.replace(/\s/g, "")
    // const newResident = resident.replace(/\s/g, "")
    const MONGO_URI_Vendor =
    tenantUri(newVendor);
  // console.log(subcategory)
  // console.log(businessTitle)
    const vendorConn = await mongoose.createConnection(MONGO_URI_Vendor, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const itemModel = newVendor + "_" + "ItemCatalog";
    const ItemCatalog = vendorConn.model(itemModel, ItemCatalogSchema);
    // console.log('ItemCatalog', ItemCatalog)
    const flyerModel = newVendor + "_" + "SavedFlyer"
    const SavedFlyer = vendorConn.model(flyerModel, FlyerSchema)

    const soughtCoupon = []
    for (let item of orderItems) {
      // console.log('item',item)
      const itemCatalog = await ItemCatalog.findOne({itemCode: item.itemCode}).select('boundFlyers')
      // console.log('boundFlyers', itemCatalog)
      if(itemCatalog.boundFlyers) {
            const flyer = itemCatalog.boundFlyers
            var flyerAccessiable = false
            const activeFlyer = await ActiveFlyer.findOne({businessTitle:vendor, vendorActiveFlyer: { $elemMatch: { flyerId : flyer.flyerId}} })
            // console.log('activeFlyer',activeFlyer)
            const stashedFlyer = await Resident.findOne({ residentName: resident, stashedFlyers: { $elemMatch: { flyerId: flyer.flyerId }}})
            // console.log('stashedFlyer', stashedFlyer)
            const targetFlyer = await Resident.findOne({ residentName: resident, targetFlyers: { $elemMatch: { flyerId: flyer.flyerId }}})
            // console.log('targetFlyer', targetFlyer)
            if(activeFlyer || stashedFlyer || targetFlyer) flyerAccessiable = true
            // console.log('flyerAccessiable', flyerAccessiable)
            if (flyerAccessiable) {
              const flyerLocated = await SavedFlyer.findOne({flyerId: flyer.flyerId})
              // console.log('flyerLocated', flyerLocated)
            const index = flyerLocated.couponValue.findIndex(coupon => coupon.couponId == flyer.couponId )
            const couponLocated = flyerLocated.couponValue[index]
            // console.log('couponLocated', couponLocated)
            switch (couponLocated.valueType) {
                case 'CASH_VALUE':
                  if(item.quantity >= couponLocated.minimalQty) {
                    soughtCoupon.push({flyerId: flyer.flyerId,
                      flyerTitle: flyerLocated.flyerTitle,
                      couponId: flyer.couponId,
                      valueType: couponLocated.valueType,
                      oneTimeUsage: couponLocated.oneTimeUsage,
                      amount: couponLocated.amount,
                      itemCode: item.itemCode,
                      couponTitle: couponLocated.couponTitle,
                      minimalAmount: couponLocated.minimalAmount,
                      minimalQty: couponLocated.minimalQty,
                      isForExceedance: couponLocated.isForExceedance,
                      isForAllItems: couponLocated.isForAllItems
                    })
                    // console.log('sought coupon cash value' + soughtCoupon)
                  }
                  break;
                case 'CASH_DISCOUNT':
                  if(item.quantity >= couponLocated.minimalQty) {
                    soughtCoupon.push({flyerId: flyer.flyerId,
                      flyerTitle: flyerLocated.flyerTitle,
                      couponId: flyer.couponId,
                      valueType: couponLocated.valueType,
                      oneTimeUsage: couponLocated.oneTimeUsage,
                      amount: couponLocated.amount,
                      itemCode: item.itemCode,
                      couponTitle: couponLocated.couponTitle,
                      minimalAmount: couponLocated.minimalAmount,
                      minimalQty: couponLocated.minimalQty,
                      isForExceedance: couponLocated.isForExceedance,
                      isForAllItems: couponLocated.isForAllItems
                    })
                  }
                  break;
                case 'PERCENTAGE_DISCOUNT':
                  var subtotal = 0
                  for(let item of orderItems) {
                    subtotal = subtotal + item.itemTotal
                  }
                  if(subtotal >= couponLocated.minimalAmount) {
                    soughtCoupon.push({flyerId: flyer.flyerId,
                      flyerTitle: flyerLocated.flyerTitle,
                      couponId: flyer.couponId,
                      oneTimeUsage: couponLocated.oneTimeUsage,
                      valueType: couponLocated.valueType,
                      amount: couponLocated.amount,
                      itemCode: item.itemCode,
                      couponTitle: couponLocated.couponTitle,
                      minimalAmount: couponLocated.minimalAmount,
                      minimalQty: couponLocated.minimalQty,
                      isForExceedance: couponLocated.isForExceedance,
                      isForAllItems: couponLocated.isForAllItems
                    })
                  }
                  break;
                case 'COMBO_CASH_VALUE':
                  var isTheCombo = true
                  for (let item of orderItems) {
                    const index = couponLocated.itemsBound.findIndex(itemBound => itemBound.itemCode == item.itemCode)
                    
                    if (index<0) {
                      isTheCombo = false
                    } else if (item.quantity != couponLocated.itemsBound[index].quantity) {
                      isTheCombo = false
                    }
                  }
                  if (isTheCombo) {
                    soughtCoupon.push({flyerId: flyer.flyerId,
                      flyerTitle: flyerLocated.flyerTitle,
                      couponId: flyer.couponId,
                      valueType: couponLocated.valueType,
                      oneTimeUsage: couponLocated.oneTimeUsage,
                      amount: couponLocated.amount,
                      itemCode: item.itemCode,
                      couponTitle: couponLocated.couponTitle,
                      minimalAmount: couponLocated.minimalAmount,
                      minimalQty: couponLocated.minimalQty,
                      isForExceedance: couponLocated.isForExceedance,
                      isForAllItems: couponLocated.isForAllItems
                    })
                  }
            } 
            } 
            
          
      }
      
    }
    // console.log('soughtCoupon', soughtCoupon)
  return soughtCoupon

  },

  setUpFlyer: async (_, { flyerId, businessTitle, time }, {}) => {
    // console.log('select template' + Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const selectedFlyer = await SavedFlyer.findOne({
      flyerId
    });
    // console.log(selectedFlyer);
    if (selectedFlyer) {
      return selectedFlyer;
    }
  },
};
