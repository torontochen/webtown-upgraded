/**
 * Query resolvers — resident.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */
const {
  CustomerCommentSchema,
  ItemCatalogSchema,
  ResidentOrderSchema,
  ShoppingCartSchema,
  logger,
  mongoose,
  tenantUri,
} = require("./_shared");

module.exports = {
  getResidentOrders: async (_, {resident}, {}) => {
    const revisedResident= resident.replace(/\s/g, "")
    const  newResident = revisedResident.replace(/\./g, "")
    // console.log(newResident)
    const MONGO_URI =
      tenantUri(newResident);

    const newConn = await mongoose.createConnection(MONGO_URI);

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

  const newConn = await mongoose.createConnection(MONGO_URI);
  logger.debug('create shoppingcart connection')
  
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
    const newConn_vendor = await mongoose.createConnection(MONGO_URI_vendor);
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

  getResidentList: async(_, args, {Resident}) => {
    const list = await Resident.find({}).select(['residentName', 'firstName', 'lastName'])
    return list
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
};
