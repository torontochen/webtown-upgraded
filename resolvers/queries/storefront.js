/**
 * Query resolvers — storefront.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */
const {
  CustomerCommentSchema,
  FlyerSchema,
  ItemCatalogSchema,
  ProductRatingSchema,
  VendorPromotionEventSchema,
  mongoose,
  tenantUri,
} = require("./_shared");

module.exports = {
  getVendorList: async(_, {}, {Vendor}) => {
    const vendor = await Vendor.find({}).select("businessTitle")
    const list = vendor.map(item => {
     return {vendor: item.businessTitle}
    })
    return list
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

  getItemCatalog: async (_, { subcategory, businessTitle }, {}) => {
    const vendor = businessTitle.replace(/\s/g, "")
    // console.log('vendor in getItemCatalog', businessTitle)
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(subcategory)
    // console.log(businessTitle)
    const newConn = await mongoose.createConnection(MONGO_URI);
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

  getCustomerRatings: async (_, {vendor}, {Resident}) => {
    const newVendor = vendor.replace(/\s/g, "")

    const MONGO_URI =
    tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI);

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

  getProductRatings: async (_, { vendor }, {Resident} ) => {
    const newVendor = vendor.replace(/\s/g, "")
    const MONGO_URI =
    tenantUri(newVendor);

  const newConn = await mongoose.createConnection(MONGO_URI);

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

  getSingleItemRating: async (_, {vendor, itemCode}, {Resident}) => {
    const newVendor = vendor.replace(/\s/g, "")
      const MONGO_URI =
      tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI);

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

  getVendorInterface: async(_, {vendor}, {Vendor, Resident}) => {
    // console.log('Vendor', vendor)
    await Vendor.findOneAndUpdate({businessTitle: vendor}, {$inc: { homePageVisit: 1}})

    const newVendor = vendor.replace(/\s/g, "")
    // console.log('newVendor', newVendor)

    const MONGO_URI =
    tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI);

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

  getVendorFlyers: async(_, {vendor}, {}) => {
    const newVendor = vendor.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(newVendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
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

  getVendorPromotionEvents: async(_, {vendor},{}) => {
        const newVendor = vendor.replace(/\s/g, "")
       const MONGO_URI =
        tenantUri(newVendor);

      const newConn = await mongoose.createConnection(MONGO_URI);

      const modelNameEvent = newVendor + "_" + "PromotionEvent";
      const VendorPromotionEvent = newConn.model(modelNameEvent, VendorPromotionEventSchema);
      const  vendorPromotionEvents = await VendorPromotionEvent.find({})

    return vendorPromotionEvents
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
    const vendorConn = await mongoose.createConnection(MONGO_URI_Vendor);
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

  getSingleCoupon: async(_, {vendor, flyerId, couponId}, {}) => {
    const newVendor = vendor.replace(/\s/g, "")
    const MONGO_URI =
    tenantUri(newVendor);
  // console.log(MONGO_URI)
  const newConn = await mongoose.createConnection(MONGO_URI);
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
};
