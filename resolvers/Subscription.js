// Subscriptions
module.exports = {
  customerRatingAdded: {
    subscribe: (_, args, { pubsub }) => {
      console.log("CUSTOMER_RATING_ADDED subscription is running")
      return pubsub.asyncIterator(["CUSTOMER_RATING_ADDED"])
    }
  },
  cityhallUpdated: {
    subscribe: (_, args, { pubsub }) => {
      console.log("CITYHALL_UPDATED subscription is running")
      return pubsub.asyncIterator(["CITYHALL_UPDATED"])
    }
  },
  flyerAdded: {
    subscribe: (_, args, {pubsub}) => {
      console.log("FLYER_ADDED subscription is running")
      return pubsub.asyncIterator(["FLYER_ADDED"])
    }
  },

  guildDealTransactionAdded: {
    subscribe: (_, args, {pubsub}) => {
      console.log("GUILD_DEAL_TRANSACTION_ADDED subscription is running")
      return pubsub.asyncIterator(['GUILD_DEAL_TRANSACTION_ADDED'])
    }
  },
  guildChatMsgAdded: {
    subscribe: (_, args, {pubsub}) => {
      console.log("GUILD_CHAT_MSG_ADDED subscription is running")
      return pubsub.asyncIterator(['GUILD_CHAT_MSG_ADDED'])
    }
  },
  messageReceived: {
    subscribe: (_, args, {pubsub}) => {
      console.log("MESSAGE_RECEIVED subscription is running")
      return pubsub.asyncIterator(["MESSAGE_RECEIVED"])
    }
  },
  monsterChestAdded: {
    subscribe: (_, args, {
      pubsub
    }) => {
      console.log("MONSTER_CHEST_ADDED subscription is running")
      return pubsub.asyncIterator(["MONSTER_CHEST_ADDED"])
    }
  },
  newsAdded: {
    subscribe: (_, args, {pubsub}) => {
      console.log("NEWS_ADD subscription is running")
      return pubsub.asyncIterator(["NEWS_ADD"])
    }
  },
  productRatingAdded: {
    subscribe: (_, args, { pubsub }) => {
      console.log("PRODUCT_RATING_ADDED subscription is running")
      return pubsub.asyncIterator(["PRODUCT_RATING_ADDED"])
    }
  },
  
  residentOrderAdded: {
    subscribe: (_, args,{pubsub}) => {
      console.log("RESIDENT_ORDER_ADDED subscription is running")
      return pubsub.asyncIterator(["RESIDENT_ORDER_ADDED"])
    }
  },
  residentSilverUpdated: {
    subscribe: (_, args, {pubsub}) => {
      console.log("RESIDENT_SILVER_UPDATED is running")
      return pubsub.asyncIterator(["RESIDENT_SILVER_UPDATED"])
    }
  },
  shoppingCartItemAdded: {
    subscribe: (_, args, {pubsub}) => {
      console.log("SHOPPING_CART_ITEM_ADDED is running")
      return pubsub.asyncIterator(["SHOPPING_CART_ITEM_ADDED"])
    }
  },
  updateActiveFlyers: {
    subscribe: (_, args, {
      pubsub
    }) => {
      console.log("UPDATE_ACTIVE_FLYERS subscription is running")
      return pubsub.asyncIterator(["UPDATE_ACTIVE_FLYERS"])
    }
  },
  updateGuildDealActive: {
    subscribe: (_, args,{pubsub}) => {
      console.log("UPDAE_GUILD_DEAL_ACTIVE subscription is running")
      return pubsub.asyncIterator(["UPDAE_GUILD_DEAL_ACTIVE"])
    }
  },
 
  vendorOrderAdded: {
    subscribe: (_, args,{pubsub}) => {
      console.log("VENDOR_ORDER_ADDED subscription is running")
      return pubsub.asyncIterator(["VENDOR_ORDER_ADDED"])
    }
  },

  orderStatusChanged: {
    subscribe: (_, args, {pubsub}) => {
      console.log("ORDER_STATUS_CHANGED subscription is running")
      return pubsub.asyncIterator(["ORDER_STATUS_CHANGED"])
    }
  },

  vendorSettlementRecordAdded: {
    subscribe: (_, args,{pubsub}) => {
      console.log("VENDOR_SETTLEMENT_RECORD_ADDED subscription is running")
      return pubsub.asyncIterator(["VENDOR_SETTLEMENT_RECORD_ADDED"])
    }
  },
}