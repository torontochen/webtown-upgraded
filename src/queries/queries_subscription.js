import gql from "graphql-tag";

export const CITYHALL_UPDATED = gql`
  subscription {
    cityhallUpdated {
      treasure
      population
      might
      metro
      governor
    }
  }`;

  export const CUSTOMER_RATING_ADDED = gql`
    subscription {
      customerRatingAdded {
        resident
        customerName
        customerAvatar
        rating
        comments
        time
        vendor
      }
    }`;

export const FLYER_ADDED = gql`
  subscription {
    flyerAdded {
      businessTitle
      businessCategory
      flyerId
      flyerTitle
      flyerType
      dateFrom
      dateTo
      promoInfo
      crossBoundary
      targetDistribute
    }
  }
`;

export const GUILD_DEAL_TRANSACTION_ADDED = gql`
  subscription {
    guildDealTransactionAdded {
        transactionId
        resident
        vendor
        purchaseAmount
        date
    }
  }`;

export const GUILD_CHAT_MSG_ADDED = gql`
  subscription {
    guildChatMsgAdded {
      guildFullName
      message {
        author
        data
        #  { 
        #   ... on TextMessage { text }
        #   ... on EmojiMessage { emoji }
        #   }
        nickName
        type
        date
      }
      residentName
      residentAvatar
      rank
    }
  }`;

export const MESSAGE_RECEIVED = gql`
  subscription{
    messageReceived {
      sender
      receiver
      receiverType
      time
      text
      fullName 
      title 
      guild 
      isRead
    }
  }`;

export const MONSTER_CHEST_ADDED = gql`
  subscription{
    monsterChestAdded {
      promotionItemTitle
      promotionItemId
      promotionType
      rewardItems
    }
  }`

export const NEWS_ADDED = gql`
  subscription {
    newsAdded {
      newsTitle
      headLine
      date
    }
  }`;

export const UPDAE_GUILD_DEAL_ACTIVE = gql`
  subscription{
    updateGuildDealActive {
              _id
              vendor
              vendorLogo
              vendorCategory
              guildDealType
              dealRedeemTerm
              specificItemList
              guildDealLevels {
                  guildDealCondition
                  guildDealAmount
                  rewardItemsSelected
                  rewardAmount
                }
              dateFrom
              dateTo
              active
              dealNo
              dealFulfillmentRecords{
                guild
                purchaseAmount
              }
      }
    }`;

export const RESIDENT_ORDER_ADDED = gql`
  subscription{
    residentOrderAdded{
      date
      orderNo
      vendor
      resident
      deliveryType
      customerName
      deliveryAddress
      pickupAddress
      totalAmount
      totalDiscount
      shipping
      paymentMethod
      impending
      dealsTitle{
            title
            flyerId
            couponId
            oneTimeUsage
          }
      isFood
      totalRewardSilver
      silverSpand
      finalizeInfo
      isGameSubstitueBuy
      isUnderDispute
      isCanceled
      isConfirmed
      disputeInfo
      note
      tax
      orderItems {
        itemCode
        description
        quantity
        unitPrice
        taxRate
        photo
      }
    }
  }`;

export const RESIDENT_SILVER_UPDATED = gql`
subscription{
  residentSilverUpdated{
    resident
    silver
  }
}`;

export const VENDOR_ORDER_ADDED = gql`
  subscription{
    vendorOrderAdded{
      date
      orderNo
      tax
      totalAmount
      totalDiscount
      shipping
      deliveryType
      customerName
      deliveryAddress
      pickupAddress
      resident
      vendor
      paymentMethod
      isUnderDispute
      isCanceled
      isConfirmed
      disputeInfo
      note
      isFulfilled
      fulfillNote
      orderItems {
        itemCode
        description
        quantity
        unitPrice
        taxRate
        
      }
    }
  }`;

export const ORDER_STATUS_CHANGED = gql`
  subscription{
    orderStatusChanged{
      resident
      vendor
      orderNo
      content
      isConfirmed
      isCanceled
      isUnderDispute
    }
  }`;

export const VENDOR_SETTLEMENT_RECORD_ADDED = gql`
  subscription{
    vendorSettlementRecordAdded{
      date
      vendor
      salesOrderNo
      purchaseOrderNo
      totalAmount
      tax
      boundaryGold
      paymentMethod
      boundaryPayable
      amountPaidByCustomer
      amountPaidToBoundary
    }
  }`;