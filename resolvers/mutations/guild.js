/**
 * Mutation resolvers — guild.
 *
 * Split out of the monolithic resolvers/Mutation.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/mutationPolicy.js.
 */
const {
  GuildChatSchema,
  GuildDealStatusSchema,
  mongoose,
  tenantUri,
} = require("./_shared");

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

  quitGuild: async(_, { residentName, guildFullName}, {Resident, Guild}) => {
     await Guild.findOneAndUpdate({ guildFullName}, {$pull: { guildMembers: { name: residentName }}})
    const resident = await Resident.findOneAndUpdate({residentName}, { $set: { guild: null }})
    return { residentName: resident.residentName, nickName: resident.nickName}
  },

  kickGuildMember: async(_, {guild, resident}, {Guild, Resident}) => {
    await Guild.findOneAndUpdate({guildFullName: guild}, {$pull:{guildMembers:{name: resident }}})
    await Resident.findOneAndUpdate({residentName: resident},{guild: null})
    return { name: resident}
  },

  promoteGuildMember: async(_, { guild, resident, newRank}, {Guild}) => {
    await Guild.findOneAndUpdate(
      {"guildFullName": guild},
      {$set: {"guildMembers.$[elem].rank": newRank}}, 
      { arrayFilters: [{ "elem.name": resident }]}
    )
    return { name: resident, newRank}
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

  saveGuildChat: async (_, {residentId, guildFullName, input}, { Resident, Guild, pubsub }) => {
    const newGuildFullName = guildFullName.replace(/\s/g, "")
    const MONGO_URI =
        tenantUri(newGuildFullName);
      const newConn = await mongoose.createConnection(MONGO_URI);
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

  commitGuildDeals: async (_, {input},{GuildDeal}) => {
    
    const { guildDealIds, guildFullName } = input
    const newGuildFullName = guildFullName.replace(/\s/g, "")
    // console.log(guildDealIds)
     const MONGO_URI =
        tenantUri(newGuildFullName);
      const newConn = await mongoose.createConnection(MONGO_URI);
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

  toggleGuildDealActive: async (_, {dealId, isActive}, {GuildDeal, pubsub}) => {
   const guildDealUpdated = await GuildDeal.findOneAndUpdate({_id: dealId}, {$set: {active: isActive}}, {new: true})

    pubsub.publish("UPDATE_GUILD_DEAL_ACTIVE ", {
        updateGuildDealActive: guildDealUpdated,
      });

    const guildDeals = await GuildDeal.find({})
    return guildDeals
  },
};
