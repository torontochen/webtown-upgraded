const Query = require('./Query')
const Mutation = require('./Mutation')
const Subscription = require('./Subscription')
// const _ = require("lodash");
// import _ from "lodash"


module.exports = {
  // Queries
  Query,

  // mutation
  Mutation,


  // subscription
  Subscription,

  // GuildMessageData: {
  //   __resolveType: obj => {
  //     if (obj.text) {
  //       return 'TextMessage'
  //     }

  //     if (obj.emoji) {
  //       return 'EmojiMessage'
  //     }
      
  //     return null
  //   }
  // }

};