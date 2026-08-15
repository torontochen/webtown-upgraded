/**
 * Mutation resolvers — order.
 *
 * Split out of the monolithic resolvers/Mutation.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/mutationPolicy.js.
 */
const {
  CustomerCommentSchema,
  FlyerSchema,
  GuildDealStatusSchema,
  ItemCatalogSchema,
  LOGO_BASE64,
  ProductRatingSchema,
  ResidentOrderSchema,
  ShoppingCartSchema,
  VendorOrderSchema,
  VendorSettlementSchema,
  cityhallUpdated,
  formatAmount,
  formatSilverAmount,
  hbs,
  inlineBase64,
  match,
  mongoose,
  path,
  tenantUri,
} = require("./_shared");

module.exports = {
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
    tenantUri(newResident);

    const newConn = await mongoose.createConnection(MONGO_URI);

    // vendor connection

    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI_Vendor =
    tenantUri(newVendor);

    const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor);

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
                  tenantUri(newGuildFullName);
                const newConn_guild = await mongoose.createConnection(MONGO_URI_GUILD);
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
      tenantUri(newResident);
  
      const newConn = await mongoose.createConnection(MONGO_URI);
                                
      // vendor connection
      const newVendor= vendor.replace(/\s/g, "")
  
      const MONGO_URI_Vendor =
      tenantUri(newVendor);
  
      const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor);
                                
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

  cancel: async(_, {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}, {pubsub}) => {
      // resident connection                     
      const revisedResident= resident.replace(/\s/g, "")
      //  console.log('revisedresident', revisedResident)
       const  newResident = revisedResident.replace(/\./g, "")
      //  console.log('newResident', newResident)
      
      const MONGO_URI =
      tenantUri(newResident);
  
      const newConn = await mongoose.createConnection(MONGO_URI);
      const modelResidentOrder = newResident + "_" + "ResidentOrder"
      const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)
  
      // vendor connection
  
      const newVendor= vendor.replace(/\s/g, "")
  
      const MONGO_URI_Vendor =
      tenantUri(newVendor);
  
      const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor);
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
      tenantUri(newResident);
  
      const newConn = await mongoose.createConnection(MONGO_URI);
      const modelResidentOrder = newResident + "_" + "ResidentOrder"
      const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)
  
      // vendor connection
  
      const newVendor= vendor.replace(/\s/g, "")
  
      const MONGO_URI_Vendor =
      tenantUri(newVendor);
  
      const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor);
      const modelVendorOrder = newVendor + "_" + "VendorOrder";
      const VendorOrder = newConnVendor.model(modelVendorOrder,  VendorOrderSchema);

      await ResidentOrder.findOneAndUpdate({ orderNo }, { $set: { isConfirmed }})
      await VendorOrder.findOneAndUpdate({ orderNo }, { $set: { isConfirmed }})
      pubsub.publish("ORDER_STATUS_CHANGED", {orderStatusChanged : {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}})
      return { vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}
  },

  dispute: async(_, {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}, {pubsub}) => {
      // resident connection                     
      const revisedResident= resident.replace(/\s/g, "")
      //  console.log('revisedresident', revisedResident)
       const  newResident = revisedResident.replace(/\./g, "")
      //  console.log('newResident', newResident)
      
      const MONGO_URI =
      tenantUri(newResident);
  
      const newConn = await mongoose.createConnection(MONGO_URI);
      const modelResidentOrder = newResident + "_" + "ResidentOrder"
      const ResidentOrder = newConn.model(modelResidentOrder, ResidentOrderSchema)
  
      // vendor connection
  
      const newVendor= vendor.replace(/\s/g, "")
  
      const MONGO_URI_Vendor =
      tenantUri(newVendor);
  
      const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor);
      const modelVendorOrder = newVendor + "_" + "VendorOrder";
      const VendorOrder = newConnVendor.model(modelVendorOrder,  VendorOrderSchema);

      await ResidentOrder.findOneAndUpdate({ orderNo }, { $set: { isUnderDispute: isUnderDispute, disputeInfo: content}})
      await VendorOrder.findOneAndUpdate({ orderNo }, { $set: { isUnderDispute: isUnderDispute, disputeInfo: content}})
      pubsub.publish("ORDER_STATUS_CHANGED", {orderStatusChanged : {vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}})
      return { vendor, resident, orderNo, content, isUnderDispute, isConfirmed, isCanceled}
  },

  fulfill: async(_, {vendor, orderNo, fulfillNote}, {}) => {
    const newVendor= vendor.replace(/\s/g, "")

    const MONGO_URI =
      tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI);

    const modelVendorOrder = newVendor + "_" + "VendorOrder"
    const VendorOrder = newConn.model(modelVendorOrder, VendorOrderSchema)
    await VendorOrder.findOneAndUpdate({ orderNo }, { $set: {isFulfilled: true, fulfillNote}})
    return { note: fulfillNote }
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
    tenantUri(newResident);

    const newConn = await mongoose.createConnection(MONGO_URI);

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
      tenantUri(newVendorName);
    // console.log(MONGO_URI)
    const newConn_vendor = await mongoose.createConnection(MONGO_URI_vendor);
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

  updateShoppingCart: async (_, {resident, itemCode, quantity}, {}) => {
    // console.log(resident)
    const revisedResident= resident.replace(/\s/g, "")
    const  newResident = revisedResident.replace(/\./g, "")

    const MONGO_URI =
    tenantUri(newResident);

    const newConn = await mongoose.createConnection(MONGO_URI);

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
        tenantUri(newResident);
    
        const newConn = await mongoose.createConnection(MONGO_URI);
                                  
        // vendor connection
        const newVendor= vendor.replace(/\s/g, "")
    
        const MONGO_URI_Vendor =
        tenantUri(newVendor);
    
        const newConnVendor = await mongoose.createConnection(MONGO_URI_Vendor);
                                  
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

  saveCustomerRating: async(_, {vendor, residentId, rating, comments,  time}, {Resident, Vendor, pubsub}) => {
    const newVendor = vendor.replace(/\s/g, "")

    const MONGO_URI =
    tenantUri(newVendor);

    const newConn = await mongoose.createConnection(MONGO_URI);

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

  saveSingleItemRating: async (_, { vendor, itemCode, residentId, rating, comments, time }, {Resident, pubsub}) => {
    const newVendor = vendor.replace(/\s/g, "")

    const MONGO_URI =
    tenantUri(newVendor);

  const newConn = await mongoose.createConnection(MONGO_URI);

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
};
