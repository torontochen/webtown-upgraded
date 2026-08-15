/**
 * Query resolvers — vendorops.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */
const {
  ItemCatalogSchema,
  VendorOrderSchema,
  VendorSettlementSchema,
  mongoose,
  tenantUri,
} = require("./_shared");

module.exports = {
  getVendorOrders: async (_, {vendor}, {}) => {
    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI =
      tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI);

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

    const newConn = await mongoose.createConnection(MONGO_URI);

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

  getVendorSettlementRecords: async(_, {vendor}, {}) => {
    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI =
      tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI);

    const modelVendorSettlement = newVendor + "_" + "VendorSettlement"
    const VendorSettlement = newConn.model(modelVendorSettlement, VendorSettlementSchema)
    const vendorSettlementRecords = await VendorSettlement.find({})
    // console.log(vendorSettlementRecords)
    return vendorSettlementRecords
  },

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

  getAllItemsCatalog: async (_, { businessTitle }, {}) => {
     const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    const newConn = await mongoose.createConnection(MONGO_URI);
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
  }
};
