/**
 * Query resolvers — guild.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */
const {
  GuildChatSchema,
  GuildDealStatusSchema,
  mongoose,
  tenantUri,
} = require("./_shared");

module.exports = {
  getAllGuilds: async(_, {}, {Guild}) => {
    const guilds = await Guild.find({})
    // console.log(guilds)
    return guilds
  },

  getAllGuildDeals: async(_, {}, { GuildDeal }) => {
    const guilds = await GuildDeal.find({})
    return guilds
  },

  getGuildChatMessages: async (_, { guildFullName }, { Resident, Guild }) => {
    const newGuildFullName = guildFullName.replace(/\s/g, "")
    const MONGO_URI =
        tenantUri(newGuildFullName);
      const newConn = await mongoose.createConnection(MONGO_URI);
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
      const newConn = await mongoose.createConnection(MONGO_URI);
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
};
