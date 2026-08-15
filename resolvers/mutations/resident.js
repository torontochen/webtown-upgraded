/**
 * Mutation resolvers — resident.
 *
 * Split out of the monolithic resolvers/Mutation.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/mutationPolicy.js.
 */
const {
  FlyerSchema,
  VendorOrderSchema,
  bcrypt,
  logger,
  match,
  mongoose,
  path,
  tenantUri,
} = require("./_shared");

module.exports = {
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

  crackEgg: async(_, {resident, silver}, {Resident}) => {
    await Resident.findOneAndUpdate({ residentName: resident}, { $inc: { silverCoins: silver}})
    return { silver }
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

  gainLoseSilver: async(_, { winner, loser, amount }, {Resident}) => {
    // console.log("gainlose amount" + amount)
    // console.log("gainlose winner" + winner)
    // console.log("gainlose loser" + loser)
    await Resident.findOneAndUpdate({residentName: winner}, { $inc: { silverCoins: amount}})
    await Resident.findOneAndUpdate({residentName: loser}, { $inc: { silverCoins: -amount}})
    return { amount }
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

  updateStashedFlyers: async (_, { residentName, flyerId }, { Resident }) => {
    const resident = await Resident.findOneAndUpdate({ residentName }, { $pull: { stashedFlyers: { flyerId }}}, { new: true })
    return resident.stashedFlyers
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
    logger.debug(playerName)
    logger.debug(rewardItems[0].itemName)
    logger.debug(promotionItemId)
    logger.debug(vendor)
    // replace all ? with :
    const newFlyerId = promotionItemId.replace(/\?/g, ':')
    logger.debug(newFlyerId)

    //Get the matching vendor info
    const vendorInfo = await Vendor.findOne({businessTitle: vendor});

    //update resident's reward item quantity
    if(rewardItems[0].itemName == "silver") {
      const resident = await Resident
      .findOne(
        {residentName: playerName}).populate({path: "guild", model: Guild})
        logger.debug(resident)

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
    tenantUri(newVendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
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
};
