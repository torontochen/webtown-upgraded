const { logger } = require("./logger");
// Subscriptions
module.exports = {
  customerRatingAdded: {
    subscribe: (_, args, { pubsub }) => {
      logger.debug("CUSTOMER_RATING_ADDED subscription is running")
      return pubsub.asyncIterator(["CUSTOMER_RATING_ADDED"])
    }
  },
  cityhallUpdated: {
    subscribe: (_, args, { pubsub }) => {
      logger.debug("CITYHALL_UPDATED subscription is running")
      return pubsub.asyncIterator(["CITYHALL_UPDATED"])
    }
  },
  flyerAdded: {
    subscribe: (_, args, {pubsub}) => {
      logger.debug("FLYER_ADDED subscription is running")
      return pubsub.asyncIterator(["FLYER_ADDED"])
    }
  },

  guildDealTransactionAdded: {
    subscribe: (_, args, {pubsub}) => {
      logger.debug("GUILD_DEAL_TRANSACTION_ADDED subscription is running")
      return pubsub.asyncIterator(['GUILD_DEAL_TRANSACTION_ADDED'])
    }
  },
  guildChatMsgAdded: {
    subscribe: (_, args, {pubsub}) => {
      logger.debug("GUILD_CHAT_MSG_ADDED subscription is running")
      return pubsub.asyncIterator(['GUILD_CHAT_MSG_ADDED'])
    }
  },
  messageReceived: {
    subscribe: (_, args, {pubsub}) => {
      logger.debug("MESSAGE_RECEIVED subscription is running")
      return pubsub.asyncIterator(["MESSAGE_RECEIVED"])
    }
  },
  monsterChestAdded: {
    subscribe: (_, args, {
      pubsub
    }) => {
      logger.debug("MONSTER_CHEST_ADDED subscription is running")
      return pubsub.asyncIterator(["MONSTER_CHEST_ADDED"])
    }
  },
  newsAdded: {
    subscribe: (_, args, {pubsub}) => {
      logger.debug("NEWS_ADD subscription is running")
      return pubsub.asyncIterator(["NEWS_ADD"])
    }
  },
  productRatingAdded: {
    subscribe: (_, args, { pubsub }) => {
      logger.debug("PRODUCT_RATING_ADDED subscription is running")
      return pubsub.asyncIterator(["PRODUCT_RATING_ADDED"])
    }
  },
  
  residentOrderAdded: {
    subscribe: (_, args,{pubsub}) => {
      logger.debug("RESIDENT_ORDER_ADDED subscription is running")
      return pubsub.asyncIterator(["RESIDENT_ORDER_ADDED"])
    }
  },
  residentSilverUpdated: {
    subscribe: (_, args, {pubsub}) => {
      logger.debug("RESIDENT_SILVER_UPDATED is running")
      return pubsub.asyncIterator(["RESIDENT_SILVER_UPDATED"])
    }
  },
  shoppingCartItemAdded: {
    subscribe: (_, args, {pubsub}) => {
      logger.debug("SHOPPING_CART_ITEM_ADDED is running")
      return pubsub.asyncIterator(["SHOPPING_CART_ITEM_ADDED"])
    }
  },
  updateActiveFlyers: {
    subscribe: (_, args, {
      pubsub
    }) => {
      logger.debug("UPDATE_ACTIVE_FLYERS subscription is running")
      return pubsub.asyncIterator(["UPDATE_ACTIVE_FLYERS"])
    }
  },
  updateGuildDealActive: {
    subscribe: (_, args,{pubsub}) => {
      logger.debug("UPDAE_GUILD_DEAL_ACTIVE subscription is running")
      return pubsub.asyncIterator(["UPDAE_GUILD_DEAL_ACTIVE"])
    }
  },
 
  vendorOrderAdded: {
    subscribe: (_, args,{pubsub}) => {
      logger.debug("VENDOR_ORDER_ADDED subscription is running")
      return pubsub.asyncIterator(["VENDOR_ORDER_ADDED"])
    }
  },

  orderStatusChanged: {
    subscribe: (_, args, {pubsub}) => {
      logger.debug("ORDER_STATUS_CHANGED subscription is running")
      return pubsub.asyncIterator(["ORDER_STATUS_CHANGED"])
    }
  },

  vendorSettlementRecordAdded: {
    subscribe: (_, args,{pubsub}) => {
      logger.debug("VENDOR_SETTLEMENT_RECORD_ADDED subscription is running")
      return pubsub.asyncIterator(["VENDOR_SETTLEMENT_RECORD_ADDED"])
    }
  },
}