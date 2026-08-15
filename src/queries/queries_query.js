import gql from "graphql-tag";

// Queries

export const EMAIL_CHECK = gql`
  query($email: String!) {
    checkEmail(email: $email) {
      emailVal
    }
  }
`;

export const CHECK_RESIDENTNAME = gql`
  query($residentName: String!, $nickName: String) {
    checkResidentName(residentName: $residentName, nickName: $nickName) {
      residentNameVal
    }
  }
`;

export const CHECK_GUILD_NAME = gql`
  query($guildName: String!, $nameType: String) {
    checkGuildName(guildName: $guildName, nameType: $nameType) {
      guildNameIsOk
      }
  }`;

export const CHECK_ITEMCODE = gql`
  query($vendor: String, $itemCode: String) {
    checkItemCode(vendor: $vendor, itemCode: $itemCode) {
      ok
    }
  }`;

export const CHECK_BUSINESSTITLE = gql`
  query($businessTitle: String!) {
    checkBusinessTitle(businessTitle: $businessTitle) {
      businessTitleVal
    }
  }
`;

export const CHECK_SAVED_FINGERPRINT = gql`
  query($fingerPrint: String!) {
    checkSavedFingerPrint(fingerPrint: $fingerPrint) {
      fingerPrintIsSaved
    }
  }
`;

export const GET_ACTIVE_FLYER = gql`
  query {
    getActiveFlyer {
      businessTitle
      logo
      businessCategory
      vendorActiveFlyer {
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
  }
`;

export const GET_AI_RESPONSE = gql`
  query($prompt: [AIPromptInput]) {
    getAIResponse(prompt: $prompt) {
      message
    }
  }`

export const GET_ALL_ITEM_CATALOG = gql`
  query($businessTitle: String!, $time: String) {
    getAllItemsCatalog(businessTitle: $businessTitle, time: $time) {
      subcategory
      itemCode
      description
      specification
      unit
      photo
      rate
      rewardSilver
      promoRate
      active
      taxRate
      event
    }
  }
`;

export const GET_ALL_GUILDS = gql`
   query{
    getAllGuilds {
      _id
      guildFullName
      guildShortName
      guildLeader
      guildScores
      guildLevel
      guildMembers {
        avatar
        name
        nickName
        rank
        might
        lat
        lng
        lastRewardDate
      }
      guildSilver
      contractedVendors
      guildLeaderRemun
      guildPurchase
      guildPost
      guildLogo
      applicants
      perk
      contributionRatio
      allies{
          guildFullName
          request
      }
      leaderBenefit
      currentMonthContribution{
        name
        nickName
        amount
      }
      previousMonthContribution{
        name
        nickName
        amount
      }
      isRulingGuild
      }
    }`;

export const GET_ALL_GUILD_DEALS = gql`
query {
  getAllGuildDeals {
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

export const GET_CITYHALL = gql`
  query{
    getCityHall{
      treasure
      population
      might
      metro
      governor
    }
  }`;


export const GET_CURRENT_RESIDENT = gql`
  query {
    getCurrentResident {
      _id
      email
      residentName
      nickName
      firstName
      lastName
      password
      country
      might
      mailStrAddress
      mailCity
      mailState
      mailCountry
      mailPostalCode
      postalCode
      avatarPic
      currentWish
      hobbies
      watchList
      receiveOnlineFlyer
      gender
      emailVerified
      goldCoins
      silverCoins
      guild {
        _id
        guildFullName
        guildShortName
        guildLeader
        guildScores
        guildLevel
        guildMembers {
          avatar
          name
          nickName
          rank
          might
          lat
          lng
          lastRewardDate
        }
        guildSilver
        contractedVendors
        guildLeaderRemun
        guildPurchase
        guildPost
        guildLogo
        applicants
        perk
        contributionRatio
        allies{
          guildFullName
          request
        }
        leaderBenefit
        currentMonthContribution{
          name
          nickName
          amount
        }
        previousMonthContribution{
          name
          nickName
          amount
        }
        isRulingGuild
      }
      guildOwned
      birthday
      favoriteFood
      flyersRead
      belief
      initialLat
      initialLng
      petLevel
      petExperience
      profileFilled
      flyersFedToPet
      propertyTax
      silverRecords {
        date
        orderNo
        vendor
        amountSpand
      }
      stashedFlyers {
        vendor
        flyerId
        flyerTitle
        flyerType
        dateFrom
        dateTo
        promoInfo
        logo
        targetDistribute
      }
      targetFlyers{
        businessTitle
        businessCategory
        logo
        flyerId
        flyerTitle
        flyerType
        dateFrom
        dateTo
        promoInfo
        crossBoundary
        targetDistribute
      }
      pet {
        _id
        petName
        petImage
        petImgUrl
        petPerformance
      }
       messages {
        sender
        receiver
        time
        text
        receiverType
        fullName 
        title 
        guild 
        isRead
      }
       guildMessages {
        sender
        receiver
        time
        text
        receiverType
        fullName 
        title 
        guild 
        isRead
      }
       systemMessages {
        sender
        receiver
        time
        text
        receiverType
        fullName 
        title 
        guild 
        isRead
      }
      usedCoupons{
        flyerId
        couponId
      }
    }
  }
`;

export const GET_CURRENT_VENDOR = gql`
  query {
    getCurrentVendor {
      _id
      tagline
      businessTitle
      email
      password
      businessUnitNo
      businessStreetNo
      businessStreetName
      businessCity
      businessState
      businessCountry
      businessPostalCode
      businessPhone
      businessHours {
        weekDay
        time
      }
      businessFax
      businessEmail
      logo
      businessCategory
      goldCoins
      silverCoins
      aboutUs
      emailVerified
      existingCustomerList
      {
        customer
        location
        purchaseTimes
        totalPurchaseAmount
        dateLastTimePurchase
      }
      website
      deliveryFees
      maxDeliveryDistance
      rating
      photoList
      boundaryCharge
      crossBoundaryBusiness
      homePageVisit
      lat
      lng
      messages {
        sender
        receiver
        time
        text
        receiverType
        fullName 
        title 
        guild 
        isRead
      }
    }
  }
`;

export const GET_CUSTOMER_RATINGS = gql`
  query($vendor: String) {
    getCustomerRatings( vendor: $vendor) {
        resident
        customerName
        customerAvatar
        rating
        comments
        time
        vendor
    }
  }`;

export const GET_FLYER_LIST = gql`
  query($businessTitle: String!) {
    getFlyerList(businessTitle: $businessTitle) {
      flyerId
      flyerTitle
      type
      setUp
      distributed
      crossBoundary
      targetDistribute
    }
  }
`;

export const GET_GAME_PROP_LIST = gql`
  query{
    getGamePropList{
      itemCode
      itemName
      picture
    }
  }`;

export const GET_GAME_SUBSTITUTE_LIST = gql`
  query{
    getGameSubstituteList{
      itemCode
      itemName
      picture
    }
  }`;

export const GET_GAME_SHOP_SUBSTITUTE = gql`
  query{
    getGameShopSubstitute{
      shopItemCode
      shopItemName
      substituteItemCode
      substituteItemName
      vendorItemCode
      vendorItemPrice
      vendor
    }
  }`;



export const GET_GUILD_CHAT_MESSAGES = gql`
  query($guildFullName: String) {
    getGuildChatMessages(guildFullName: $guildFullName) {
      guildFullName
      message {
        author
        data 
        # { 
        #   ... on TextMessage { text }
        #   ... on EmojiMessage { emoji }
        #   }
        type
        date
        nickName
      }
      residentName
      residentAvatar
      rank
    }
  }`;

export const GET_GUILD_LOGOS = gql`
  query{
    getGuildLogos{
      logoString
    }
  }`;

export const GET_GUILD_DEALS_STATUS = gql`
  query($guildFullName: String) {
    getGuildDealsStatus(guildFullName: $guildFullName) {
      guildDealId
      vendor
      vendorLogo
      dateFrom
      dateTo
      guildDealType
      redeemTerm
      dealNo
      transactions {
        transactionId
        resident
        purchaseAmount
        date
        vendor
      }
      specificItemList
      guildDealLevels {
          guildDealCondition
          guildDealAmount
          rewardItemsSelected
          rewardAmount
      }
    }
  }`;



export const GET_ITEM_CATALOG = gql`
  query($subcategory: String, $businessTitle: String ) {
    getItemCatalog(
      subcategory: $subcategory
      businessTitle: $businessTitle
    ) {
        subcategory
        itemCode
        specification
        rewardSilver
        description
        unit
        photo
        rate
        promoRate
        active
        taxRate
        event
    }
  }
`;

export const GET_METRO_SPEC = gql`
  query {
    getMetroSpec {
      residentOutsideBoundary
      residentInsideBoundary
    }
  }`;

export const GET_PETS = gql`
  query {
    getPets {
      _id
      petName
      petImage
      petImgUrl
      petPerformance
    }
  }
`;

export const GET_PICKUP_ADDRESS = gql`
  query($vendorName: String) {
    getPickupAddress(vendorName: $vendorName) {
      vendor
      address
    }
  }`;

export const GET_PRODUCT_RATINGS = gql`
  query($vendor: String) {
    getProductRatings(vendor: $vendor) {

      resident
      customerName
      customerAvatar
      rating
      comments
      # reply
      time
      itemCode
      vendor
    }
  }`;

export const GET_PROMOTION_EVENTS = gql`
  query {
    getPromotionEvents {
      vendor
      vendorUnitNo
      vendorStreetNo
      vendorStreetName
      vendorCity
      vendorState
      vendorCountry
      vendorCategory
      vendorLogo
      vendorPhone
      vendorEmail
      vendorRating
      eventType
      eventPhoto
      eventTitle
      eventInstruction
      promotionItems 
      dateFrom
      dateTo
      eventId
      lat
      lng
    }
  }`;

export const GET_MONSTER_CHEST = gql`
  query {
    getMonsterChest {
      vendor
      promotionItemTitle
      promotionItemId
      promotionType
      rewardItems {
        itemName
        quantity
      }
    }
  }`

  export const GET_NEWS = gql`
   query {
     getNews {
       newsTitle
       headLine
       date
     }
   }`;


export const GET_EVENT_CATEGORY= gql`
 query{
   getEventCategory {
     eventName
   }
 }`

export const GET_PRODUCTS_CATEGORIES = gql`
  query {
    getProductCategory {
      category
      items
    }
  }
`;

export const GET_REWARD_ITEMS = gql`
  query {
    getRewardItems {
      itemName
      icon
    }
  }`

export const GET_RESTAURANT_CATEGORIES = gql`
  query {
    getRestaurantCategory {
      items
    }
  }
`;

export const GET_RESIDENT_ORDERS = gql`
  query($resident: String) {
    getResidentOrders(resident: $resident) {
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
      dealsTitle
      {
            title
            flyerId
            couponId
            oneTimeUsage
          }
      isFood
      silverSpand
      totalRewardSilver
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

export const GET_SERVICES_CATEGORIES = gql`
  query {
    getServiceCategory {
      category
      items
    }
  }
`;

export const GET_SHOPPING_CART = gql`
  query($resident: String) {
    getShoppingCart(resident: $resident) {
        itemCode
        vendorName
        vendorLat
        vendorLng
        deliveryFees
        maxDeliveryDistance
        vendorLogo
        description
        quantity
        rewardSilver
        photo
        rate
        promoRate
        taxRate
    }
  }`;

export const GET_SKETCH_LIST = gql`
  query($businessTitle: String!) {
    getSketchList(businessTitle: $businessTitle) {
      flyerId
      flyerTitle
      type
    }
  }
`;

export const GET_SELECTED_SKETCH = gql`
  query($flyerId: String!, $businessTitle: String!, $time: String) {
    getSelectedSketch(
      flyerId: $flyerId
      businessTitle: $businessTitle
      time: $time
    ) {
      _id
      sketchPages {
        flyerPageElements {
          id
          htmlInner
          htmlOuter
          htmlOuterStyle
          x
          y
          w
          h
        }
        nodeId
      }
      sketchPages_C {
        flyerPageElements {
          id
          htmlInner
          htmlOuter
          htmlOuterStyle
          x
          y
          w
          h
        }
        nodeId
      }
      flyerId
      flyerTitle
      type
      backgroundColor
      width
      height
      backgroundColor_C
      width_C
      height_C
      origin
    }
  }
`;

export const GET_SELECTED_TEMPLATE = gql`
  query($templateId: String!, $businessTitle: String!, $time: String) {
    getSelectedTemplate(
      templateId: $templateId
      businessTitle: $businessTitle
      time: $time
    ) {
      _id
      sketchPages {
        flyerPageElements {
          id
          htmlInner
          htmlOuter
          htmlOuterStyle
          x
          y
          w
          h
        }
        nodeId
      }
      sketchPages_C {
        flyerPageElements {
          id
          htmlInner
          htmlOuter
          htmlOuterStyle
          x
          y
          w
          h
        }
        nodeId
      }
      flyerId
      flyerTitle
      type
      backgroundColor
      width
      height
      backgroundColor_C
      width_C
      height_C
      origin
    }
  }
`;

export const GET_SELECTED_FLYER_CLIENT_VIEW = gql`
  query($flyerId: String!, $businessTitle: String!, $time: String, $resident: String) {
    getSelectedFlyerClientView(
      flyerId: $flyerId
      businessTitle: $businessTitle
      time: $time
      resident: $resident
    ) {
        vendor
        flyerId
        couponId
        base64
        width
        height
        flyerType
        couponType
        flyerTitle
        couponTitle
    }
  }
`;

export const GET_SINGLE_ITEM_RATING = gql`
  query($vendor: String, $itemCode: String) {
    getSingleItemRating ( vendor: $vendor, itemCode: $itemCode) {
      itemCode
      averageRating
      customerRatings {
        resident
        customerName
        customerAvatar
        rating
        comments
        time
        vendor
      }
    }
  }`;

  export const GET_TARGET_DISTRIBUTE_RESIDENT = gql`
    query($age: [Int],
      $gender: String,
      $religion: String,
      $hobbies: [String],
      $favoriteFood: [String],
      $regions: [String],
      $distance: Int,
      $wishList: String,
      $wishChecked: Boolean,
      $vendorLat: Float
      $vendorLng: Float) {
        getTargetDistributeResident(age: $age,
                                  gender: $gender,
                                  religion: $religion,
                                  hobbies: $hobbies,
                                  favoriteFood: $favoriteFood,
                                  regions: $regions,
                                  distance: $distance,
                                  wishList: $wishList,
                                  wishChecked: $wishChecked,
                                  vendorLat: $vendorLat,
                                  vendorLng: $vendorLng
                                  ){
                                number
                                locations {
                                  lat
                                  lng
                                }
                                residentList
                              }
    }`;

export const GET_TEMPLATE_LIST = gql`
  query($businessTitle: String!) {
    getTemplateList(businessTitle: $businessTitle) {
      templateId
      templateTagName
      templateType
    }
  }
`;

// export const GET_VENDOR_CUSTOMER_RATINGS = gql`
//   query($vendor: String){
//     getVendorCustomerRatings(vendor: $vendor){
//       customerName
//       customerAvatar
//       rating
//       comments
//       time
//       vendor
//     }
//   }`
export const GET_VENDOR_CHECKOUT_INFOS = gql`
  query($vendor: String){
    getVendorCheckoutInfos(vendor: $vendor){
      lat
      lng
      deliveryFees
      maxDeliveryDistance
    }
  }`;

export const GET_VENDOR_FLYERS = gql`
  query($vendor: String){
    getVendorFlyers(vendor: $vendor){
      _id
      sketchPages {
        flyerPageElements {
          id
          htmlInner
          htmlOuter
          htmlOuterStyle
          x
          y
          w
          h
        }
        nodeId
      }
      sketchPages_C {
        flyerPageElements {
          id
          htmlInner
          htmlOuter
          htmlOuterStyle
          x
          y
          w
          h
        }
        nodeId
      }
      flyerId
      flyerTitle
      type
      backgroundColor
      width
      height
      backgroundColor_C
      width_C
      height_C
      dateFrom
      dateTo
      quantityDistributed
      quantityRedeemed
      vendor
      quantityRead
      salesGenerated
      totalPages
      setUp
      distributed
      flyerPage_C {
        id
        previewString
      }
      couponPages {
        id
        previewString
      }
      couponValue {
        valueType
        amount
        couponId
        couponTitle
        oneTimeUsage
        minimalAmount
        minimalQty
        isForAllItems
        isForExceedance
        itemsBound {
          itemCode
          description
          unit
          quantity
        }
      }
    }
  }`;

export const GET_VENDOR_GUILD_DEALS = gql`
  query($vendor: String!) {
    getVendorGuildDeals(vendor: $vendor) {
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

export const GET_VENDOR_LIST = gql`
  query{
    getVendorList{
      vendor
    }
  }`;

export const GET_VENDOR_ORDERS = gql`
query($vendor: String) {
  getVendorOrders(vendor: $vendor) {
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
      dealsTitle
      {
            title
            flyerId
            couponId
            oneTimeUsage
          }
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

export const GET_VENDOR_SEARCH_RESULT = gql`
  query($searchItems: [String]){
    getVendorSearchResult(searchItems: $searchItems){
      vendorStreetNo 
      vendorStreetName 
      vendorCity 
      vendorState 
      vendorCountry
      vendorPhone
      vendorEmail
      vendorRating
      vendor 
      vendorLogo
      vendorCategory
      lat
      lng
    }
  }`;

export const GET_VENDOR_SALES_INFO = gql`
  query($vendor: String){
    getVendorSalesInfo(vendor: $vendor){
      dailySales{
        sales
        orders
      }
      monthToDateSales{
        sales
        orders
      }
      yearToDateSales{
        sales
        orders
      }
    }
  }`;

export const GET_VENDOR_SETTLEMENT_RECORDS = gql`
  query($vendor: String) {
    getVendorSettlementRecords( vendor: $vendor) {
      date
      vendor
      salesOrderNo
      purchaseOrderNo
      totalAmount
      totalDiscount
      tax
      boundaryGold
      paymentMethod
      boundaryPayable
      amountPaidByCustomer
      amountPaidToBoundary
    }
  }`;

export const GET_VENDOR_PROMOTION_EVENTS = gql`
  query($vendor: String) {
    getVendorPromotionEvents (vendor: $vendor) {
      eventType
      eventPhoto
      eventTitle
      eventInstruction
      promotionItems
      dateFrom
      dateTo
      postOnPortal
    }
  }`;

export const GET_VENDOR_INTERFACE = gql`
  query($vendor: String) {
    getVendorInterface (vendor: $vendor) {
      _id
      tagline
      businessTitle
      businessUnitNo
      businessStreetNo
      businessStreetName
      businessCity
      businessState
      businessCountry
      businessPostalCode
      businessPhone
      businessHours {
        weekDay
        time
      }
      businessFax
      businessEmail
      logo
      businessCategory
      aboutUs
      website
      lat
      lng
      deliveryFees
      maxDeliveryDistance
      photoList
      vendorPromotionEvents {
        eventType
        eventPhoto
        eventTitle
        eventInstruction
        promotionItems
        dateFrom
        dateTo
      }
      itemCatalog {
        subcategory
        itemCode
        description
        specification
        rewardSilver
        unit
        photo
        rate
        promoRate
        active
        taxRate
        event
      }
      customerRatings {
        resident
        customerName
        customerAvatar
        rating
        comments
        time
        vendor
      }
    }
  }`;



export const SET_UP_FLYER = gql`
  query($flyerId: String!, $businessTitle: String!, $time: String) {
    setUpFlyer(flyerId: $flyerId, businessTitle: $businessTitle, time: $time) {
      _id
      sketchPages {
        flyerPageElements {
          id
          htmlInner
          htmlOuter
          htmlOuterStyle
          x
          y
          w
          h
        }
        nodeId
      }
      sketchPages_C {
        flyerPageElements {
          id
          htmlInner
          htmlOuter
          htmlOuterStyle
          x
          y
          w
          h
        }
        nodeId
      }
      flyerId
      flyerTitle
      type
      backgroundColor
      width
      height
      backgroundColor_C
      width_C
      height_C
      dateFrom
      dateTo
      quantityDistributed
      quantityRedeemed
      vendor
      quantityRead
      salesGenerated
      totalPages
      setUp
      distributed
      flyerPage_C {
        id
        previewString
      }
      couponPages {
        id
        previewString
      }
      couponValue {
        valueType
        amount
        couponId
        couponTitle
        oneTimeUsage
        minimalAmount
        minimalQty
        isForAllItems
        isForExceedance
        itemsBound {
          itemCode
          description
          unit
          quantity
        }
      }
    }
  }
`;


export const SEARCH_AVAILABLE_DEALS = gql`
  query($input: DealSearchInput){
    searchAvailableDeals(input: $input) {
      flyerId
      couponId
      valueType
      oneTimeUsage
      amount
      itemCode
      couponTitle
      flyerTitle
      isForExceedance
      isForAllItems
      minimalAmount
      minimalQty
    }
  }`;

export const VENDOREMAIL_CHECK = gql`
  query($vendorEmail: String!) {
    checkVendorEmail(vendorEmail: $vendorEmail) {
      vendorEmailVal
    }
  }
`;
