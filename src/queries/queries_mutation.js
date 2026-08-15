import gql from "graphql-tag";

// Mutations

export const ALLY_GUILD = gql`
  mutation($guildAsk: String, $guildAccept: String){
    allyGuild(guildAsk: $guildAsk, guildAccept: $guildAccept){
      guildFullName
      guildShortName
      guildScores
      guildLevel
      guildMembers
      guildPost
      guildLogo
    }
  }`;

  export const CALL_GROUP_PURCHASE = gql`
    mutation($newsTitle: String, $headLine: String, $date: String){
      callGroupPurchase(newsTitle: $newsTitle, headLine: $headLine, date: $date){
        newsTitle
        headLine 
        date
      }
    }`;

export const DISTRIBUTE_FLYER = gql`
  mutation($input: DistributeFlyerInput) {
    distributeFlyer(input: $input) {
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

export const DISALLY = gql`
  mutation($guildAsk: String, $guildAccept: String){
    disally(guildAsk: $guildAsk, guildAccept: $guildAccept){
      guildFullName
      guildShortName
      guildScores
      guildLevel
      guildMembers
      guildPost
      guildLogo
    }
  }`;


export const TARGET_DISTRIBUTE = gql`
  mutation($input: TargetDistributeInput) {
    targetDistribute(input: $input) {
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
// export const CHANGE_ORDER_STATUS = gql`
//   mutation($vendor: String, $orderNo: String, $status: Boolean) {
//     changeOrderStatus(vendor: $vendor, orderNo: $orderNo, status: $status) {
//       vendor
//       orderNo
//       status
//     }
//   }`;

export const COMMIT_GUILD_DEALS = gql`
  mutation($input: GuildDealsCommitedInput) {
    commitGuildDeals(input: $input) {
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

export const CREATE_PROMOTION_EVENT = gql`
mutation($input: PromotionEventInput){
  createPromotionEvent(input: $input) {
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

export const CONFIRM = gql`
  mutation(
    $vendor: String, 
    $resident: String, 
    $orderNo: String, 
    $content: String, 
    $isUnderDispute: Boolean, 
    $isConfirmed: Boolean, 
    $isCanceled: Boolean){
    confirm(vendor: $vendor, 
      resident: $resident, 
      orderNo: $orderNo, 
      content: $content, 
      isUnderDispute: $isUnderDispute, 
      isConfirmed: $isConfirmed, 
      isCanceled: $isCanceled){
        vendor
        resident
        orderNo
        content
        isUnderDispute
        isConfirmed
        isCanceled
      }
  }`;

export const CANCEL = gql`
  mutation(
    $vendor: String, 
    $resident: String, 
    $orderNo: String, 
    $content: String, 
    $isUnderDispute: Boolean, 
    $isConfirmed: Boolean, 
    $isCanceled: Boolean){
    cancel(vendor: $vendor, 
      resident: $resident, 
      orderNo: $orderNo, 
      content: $content, 
      isUnderDispute: $isUnderDispute, 
      isConfirmed: $isConfirmed, 
      isCanceled: $isCanceled){
        vendor
        resident
        orderNo
        content
        isUnderDispute
        isConfirmed
        isCanceled
      }
  }`;

  export const CRACK_EGG = gql`
    mutation($resident: String, $silver: Int){
      crackEgg(resident: $resident, silver: $silver){
        silver
      }
    }`;

export const DISPUTE = gql`
  mutation(
    $vendor: String, 
    $resident: String, 
    $orderNo: String, 
    $content: String, 
    $isUnderDispute: Boolean, 
    $isConfirmed: Boolean, 
    $isCanceled: Boolean){
    dispute(vendor: $vendor, 
      resident: $resident, 
      orderNo: $orderNo, 
      content: $content, 
      isUnderDispute: $isUnderDispute, 
      isConfirmed: $isConfirmed, 
      isCanceled: $isCanceled){
        vendor
        resident
        orderNo
        content
        isUnderDispute
        isConfirmed
        isCanceled
      }
  }`;

export const DISTRIBUTE_WELFARE = gql`
  mutation( $welfare: Int, $total: Int, $metro: String) {
    distributeWelfare( welfare: $welfare, total: $total, metro: $metro){
      distributed
    }
  }`;

export const EDIT_GUILD = gql`
  mutation($guildId: ID,
    $guildFullName: String,
    $guildShortName: String,
    $guildLogo: String,
    $guildPost: String,
    $perk: Float,
    $contributionRatio: Float) {
      editGuild(guildId: $guildId,
    guildFullName: $guildFullName,
    guildShortName: $guildShortName,
    guildLogo: $guildLogo,
    guildPost: $guildPost,
    perk: $perk,
    contributionRatio: $contributionRatio) {
      guildFullName,
      guildShortName,
      guildLogo,
      guildPost,
      perk,
      contributionRatio
    }
    }`;

export const FEED_PET = gql`
  mutation($residentName: String, 
           $flyerId: String, 
           $stashOrActive: String,
           $petExperienceGained: Int, 
           $silverRewarded: Int
           $targetDistribute: Boolean) {
    feedPet(residentName: $residentName, 
            flyerId: $flyerId, 
            stashOrActive: $stashOrActive, 
            petExperienceGained: $petExperienceGained, 
            silverRewarded: $silverRewarded
            targetDistribute: $targetDistribute) {
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
        guildMembers{
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
        allies {
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
      hobbies
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
  }`;

export const FULFILL = gql`
    mutation($vendor: String, $orderNo: String, $fulfillNote: String){
      fulfill(vendor: $vendor, orderNo: $orderNo, fulfillNote: $fulfillNote) {
        note
      }
    }`;

export const JOIN_GUILD = gql`
  mutation($residentName: String, $nickName: String, $avatar: String, $guildId: ID, $lat: Float, $lng: Float) {
    joinGuild(residentName: $residentName, nickName: $nickName, avatar: $avatar, guildId: $guildId, lat: $lat, lng: $lng) {
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
      allies {
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

export const KICK_GUILD_MEMBER = gql`
  mutation($guild: String, $resident: String){
    kickGuildMember(guild: $guild, resident: $resident){
      name
    }
  }`;

export const PLACE_ORDER = gql`
  mutation(
    $resident: String 
    $vendor: String 
    $deliveryType: String 
    $customerName: String
    $deliveryAddress: String 
    $pickupAddress: String 
    $totalAmount: Float 
    $totalDiscount: Float
    $shipping: Float
    $silverSpand: Int
    $tax: Float 
    $valueDiscountList: [ValueDiscountListInput]
    $salesOrderItems: [SalesOrderItemInput]
    $paymentMethod: String
    $impendingOrderNo: String
    $note: String
    $dealsTitle: [DealTitleInput]){
      placeOrder(
        resident: $resident
        vendor: $vendor
        deliveryType: $deliveryType
        customerName: $customerName
        deliveryAddress: $deliveryAddress
        pickupAddress: $pickupAddress
        totalAmount: $totalAmount
        totalDiscount: $totalDiscount
        shipping: $shipping
        silverSpand: $silverSpand
        tax: $tax
        valueDiscountList: $valueDiscountList
        salesOrderItems: $salesOrderItems
        paymentMethod: $paymentMethod
        impendingOrderNo: $impendingOrderNo
        note: $note
        dealsTitle: $dealsTitle){
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
          impending
          finalizeInfo
          isGameSubstitueBuy
          isUnderDispute
          isCanceled
          isConfirmed
          disputeInfo
          paymentMethod
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


export const PREPAY = gql`
  mutation(
    $resident: String 
    $vendor: String 
    $customerName: String
    $totalAmount: Float 
    $totalDiscount: Float
    $silverSpand: Int
    $tax: Float 
    $valueDiscountList: [ValueDiscountListInput]
    $paymentMethod: String
    $dealsTitle: [DealTitleInput]){
      prepay(
        resident: $resident
        vendor: $vendor
        customerName: $customerName
        totalAmount: $totalAmount
        totalDiscount: $totalDiscount
        silverSpand: $silverSpand
        tax: $tax
        valueDiscountList: $valueDiscountList
        paymentMethod: $paymentMethod
        dealsTitle: $dealsTitle){
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
          paymentMethod
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

export const PROMOTE_GUILD_MEMBER = gql`
  mutation($guild: String, $resident: String, $newRank: Int){
    promoteGuildMember(guild: $guild, resident: $resident, newRank: $newRank){
      name
      newRank
    }
  }`;

export const QUIT_GUILD = gql`
  mutation($residentName: String, $guildFullName: String){
    quitGuild(residentName: $residentName, guildFullName: $guildFullName){
      residentName
      nickName
    }
  }`;


  export const READ_MESSAGE = gql`
    mutation($sender: String, $receiver: String, $guild: String, $time: String, $type: String){
      readMessage(sender: $sender, receiver: $receiver, guild: $guild, time: $time, type: $type){
        sender
        receiver
        guild 
        time
      }
    }`;

export const REWARD_GUILD_MEMBER = gql`
  mutation($resident: String, $guild:String, $silverAmount: Int){
    rewardGuildMember(resident: $resident, guild: $guild, silverAmount: $silverAmount){
      name 
      silverAmount
    }
  }`;

export const SAVE_CUSTOMER_RATING = gql`
  mutation(
    $vendor: String
    $residentId: ID
    $rating: Float
    $comments: String
    $time: String) {
      saveCustomerRating(
        vendor: $vendor
        residentId: $residentId
        rating: $rating
        comments: $comments
        time: $time
      ) {
        resident
        customerName
        customerAvatar
        rating
        comments
        time
        vendor
      }
    }`;

export const SAVE_FLYER = gql`
  mutation($input: SketchPagesInput!) {
    saveFlyer(input: $input) {
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

export const SAVE_GUILD_DEALS = gql`
  mutation($input: GuildDealsInput
          ) {
          saveGuildDeals(input: $input) {
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

export const SAVE_GUILD_CHAT = gql`
  mutation( $residentId: ID, $guildFullName: String, $input: GuildMessageInput) {
    saveGuildChat(residentId: $residentId, guildFullName: $guildFullName, input: $input) {
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

export const SAVE_SINGLE_ITEM_RATING = gql`
  mutation(
    $itemCode: String
    $vendor: String
    $residentId: ID
    $rating: Float
    $comments: String
    $time: String) {
      saveSingleItemRating(
        itemCode: $itemCode
        vendor: $vendor
        residentId: $residentId
        rating: $rating
        comments: $comments
        time: $time) {
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

export const SAVE_SHOPPING_CART = gql`
  mutation(
    $resident: String
    $vendor: ID
    $itemCode: String
    $description: String
    $quantity: Int
    $rewardSilver: Int
    $rate: Float
    $promoRate: Float
    $taxRate: Float
  ) {
    saveShoppingCart(
      resident: $resident
      vendor: $vendor
      itemCode: $itemCode
      description: $description
      quantity: $quantity
      rewardSilver: $rewardSilver
      rate: $rate
      promoRate: $promoRate
      taxRate: $taxRate
    ) {
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

export const SAVE_SKETCH = gql`
  mutation($input: SketchPagesInput!) {
    saveSketch(input: $input) {
      flyerId
      flyerTitle
      type
    }
  }
`;

export const SAVE_SUBSTITUTE_ITEMS = gql`
  mutation($vendor: String, $input: SubstituteItemInput, $dateFrom: String, $dateTo: String ){
    saveSubstituteItems(input: $input, vendor: $vendor, dateFrom: $dateFrom, dateTo: $dateTo){
      isSaved
    }
  }`;

export const SAVE_TEMPLATE = gql`
  mutation($input: FlyerTemplateInput!) {
    saveTemplate(input: $input) {
      templateId
      templateTagName
      templateType
    }
  }
`;

export const SAVE_ITEM_CATALOG = gql`
  mutation($input: ItemCatalogInput!) {
    saveItemCatalog(input: $input) {
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
        event
        taxRate
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation(
    $sender: String
    $receiver: String
    $receiverType: String
    $time: String
    $text:String
    $fullName: String
    $title: String
    $guild: String
  ) {
    sendMessage(
      sender: $sender
      receiver: $receiver
      receiverType: $receiverType
      time: $time
      text: $text
      fullName: $fullName
      guild: $guild
      title: $title
    ) {
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


export const SEND_WISH = gql`
  mutation(
    $sender: String
    $wishKeywords: [String] 
    $text: String 
    $fullName: String
  ) {
    sendWish(
      sender: $sender
      wishKeywords: $wishKeywords
      text: $text
      fullName: $fullName
    ) {
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

export const SIGNUP_RESIDENT = gql`
  mutation(
    $email: String!
    $password: String!
    $postalCode: String!
    $firstName: String!
    $lastName: String!
    $initialLat: Float
    $initialLng: Float
  ) {
    signupResident(
      email: $email
      password: $password
      postalCode: $postalCode
      firstName: $firstName
      lastName: $lastName
      initialLat: $initialLat
      initialLng: $initialLng
    ) {
      emailSent
    }
  }
`;

export const SIGNUP_VENDOR = gql`
  mutation(
    $tagline: String
    $businessTitle: String!
    $email: String!
    $password: String!
    $businessUnitNo: String
    $businessStreetNo: String
    $businessStreetName: String
    $businessCity: String
    $businessPostalCode: String
    $businessPhone: [String!]
    $businessFax: String
    $businessEmail: String
    $businessHours: [BusinessHourInput]
    $logo: String
    $photoList: [String]
    $businessCategory: [String!]
    $aboutUs: String
    $website: String
    $deliveryFees: Float,
    $maxDeliveryDistance: Float,
    $lat: Float
    $lng: Float
  ) {
    signupVendor(
      tagline: $tagline
      businessTitle: $businessTitle
      email: $email
      password: $password
      businessUnitNo: $businessUnitNo
      businessStreetNo: $businessStreetNo
      businessStreetName: $businessStreetName
      businessCity: $businessCity
      businessPostalCode: $businessPostalCode
      businessPhone: $businessPhone
      businessFax: $businessFax
      businessEmail: $businessEmail
      businessHours: $businessHours
      logo: $logo
      photoList: $photoList
      businessCategory: $businessCategory
      aboutUs: $aboutUs
      website: $website
      deliveryFees: $deliveryFees,
      maxDeliveryDistance: $maxDeliveryDistance,
      lat: $lat
      lng: $lng
    ) {
      emailSent
    }
  }
`;

export const SIGNIN_RESIDENT = gql`
  mutation($email: String!, $password: String!, $fingerPrint: String) {
    signinResident(
      email: $email
      password: $password
      fingerPrint: $fingerPrint
    ) {
      token
      confirmed
    }
  }
`;

export const SIGNIN_VENDOR = gql`
  mutation($email: String!, $password: String!, $fingerPrint: String) {
    signinVendor(
      email: $email
      password: $password
      fingerPrint: $fingerPrint
    ) {
      token
      confirmed
    }
  }
`;

export const STASH_FLYER = gql`
mutation(
    $residentName: String! 
    $vendor: String! 
    $flyerId: String! 
    $flyerTitle: String!
    $flyerType: String!
    $dateFrom: String!
    $dateTo: String!
    $promoInfo: String
    $logo: String!
    $targetDistribute: Boolean) {
    stashFlyer(
      residentName: $residentName 
      vendor: $vendor 
      flyerId: $flyerId
      flyerTitle: $flyerTitle
      flyerType: $flyerType
      dateFrom: $dateFrom
      dateTo: $dateTo
      promoInfo: $promoInfo
      targetDistribute: $targetDistribute
      logo: $logo) {
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
}`

export const START_GUILD = gql`
  mutation($guildLeader: String, 
  $guildLeaderAvatar: String, 
  $guildLeaderNickName: String, 
  $guildFullName: String, 
  $guildShortName: String, 
  $guildLogo: String, 
  $guildPost: String,
  $perk: Float,
  $contributionRatio: Float,
  $lat: Float
  $lng: Float) {
    startGuild(
    guildLeader: $guildLeader
    guildLeaderAvatar: $guildLeaderAvatar
    guildLeaderNickName: $guildLeaderNickName
    guildFullName: $guildFullName 
    guildShortName: $guildShortName 
    guildLogo: $guildLogo 
    guildPost: $guildPost
    perk: $perk
    contributionRatio: $contributionRatio
    lat: $lat
    lng: $lng) {
      idAdded
      guilds{
        _id
        guildFullName
        guildShortName
        guildLeader
        guildScores
        guildLevel
        guildMembers{
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
    }
  }`;

export const TOGGLE_GUILD_DEAL_ACTIVE = gql`
  mutation($dealId: ID, $isActive: Boolean) {
    toggleGuildDealActive(dealId: $dealId, isActive: $isActive) {
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
        }
    }`;

  export const TRANSFER_GUILD_LEADER_REMUN = gql`
    mutation($resident: String, $guild: String, $amount: Int){
      transferGuildLeaderRemun(resident: $resident, guild: $guild, amount: $amount) {
        amount
      }
    }`;

  export const TRANSFER_GUILD_LEADERSHIP = gql`
    mutation($leader: String, $member: String, $guildId: ID) {
      transferGuildLeadership(leader: $leader, member: $member, guildId: $guildId) {
        isTransfered
      }
    }`;

export const UPDATE_AVATAR = gql`
  mutation($avatarUpdated: String!, $email: String!) {
    updateAvatar(avatarUpdated: $avatarUpdated, email: $email) {
      avatar
    }
  }
`;

export const UPDATE_GALLERY_FILES = gql`
  mutation($vendor: String!, $photoList: [String]) {
    updateGalleryFiles(vendor: $vendor, photoList: $photoList) {
        photoList
        }
      }
    `;

export const UPDATE_MONSTER_CHEST = gql`
  mutation( 
    $vendor: String
    $promotionItemTitle: String,
    $promotionItemId: String,
    $promotionType: String,
    $rewardItems: [RewardItemInChestInput]) {
      updateMonsterChest(
        vendor: $vendor
        promotionItemTitle: $promotionItemTitle
        promotionItemId: $promotionItemId
        promotionType: $promotionType
        rewardItems: $rewardItems
      ) {
        saved
      }
    }`

export const UPDATE_PROFILE = gql`
  mutation(
    $residentId: ID
    $residentName: String
    $nickName: String
    $lastName: String
    $firstName: String
    $mailPostalCode: String
    $mailStrAddress: String
    $mailCity: String
    $gender: String
    $birthday: String
    $pet: String
    $postalCode: String
    $password: String
    $hobbies: [String]
    $favoriteFood: [String]
    $belief: String
    $initialLat: Float
    $initialLng: Float
  ) {
    updateProfile(
      residentId: $residentId
      residentName: $residentName
      nickName: $nickName
      lastName: $lastName
      firstName: $firstName
      mailPostalCode: $mailPostalCode
      mailStrAddress: $mailStrAddress
      mailCity: $mailCity
      gender: $gender
      birthday: $birthday
      pet: $pet
      postalCode: $postalCode
      password: $password
      hobbies: $hobbies
      favoriteFood: $favoriteFood
      belief: $belief
      initialLat: $initialLat
      initialLng: $initialLng
    ) {
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
        guildMembers{
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
      hobbies
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

export const UPDATE_SHOPPING_CART = gql`
  mutation($resident: String, $itemCode:String, $quantity: Int){
    updateShoppingCart(resident: $resident, itemCode: $itemCode, quantity: $quantity) {
        itemCode
        quantity
    }
  }`;

export const UPDATE_VENDOR_PROFILE = gql`
  mutation(
    $tagline: String
    $businessTitle: String!
    $email: String!
    $password: String
    $businessUnitNo: String
    $businessStreetNo: String
    $businessStreetName: String
    $businessCity: String
    $businessPostalCode: String
    $businessPhone: [String!]
    $businessFax: String
    $businessEmail: String
    $businessHours: [BusinessHourInput]
    $logo: String
    $businessCategory: [String!]
    $aboutUs: String
    $website: String
    $deliveryFees: Float,
    $maxDeliveryDistance: Float,
    $photoList: [String]
    $crossBoundaryBusiness: Boolean
    $lat: Float
    $lng: Float
  ) {
    updateVendorProfile(
      tagline: $tagline
      businessTitle: $businessTitle
      email: $email
      password: $password
      businessUnitNo: $businessUnitNo
      businessStreetNo: $businessStreetNo
      businessStreetName: $businessStreetName
      businessCity: $businessCity
      businessPostalCode: $businessPostalCode
      businessPhone: $businessPhone
      businessFax: $businessFax
      businessEmail: $businessEmail
      businessHours: $businessHours
      logo: $logo
      businessCategory: $businessCategory
      aboutUs: $aboutUs
      website: $website
      deliveryFees: $deliveryFees,
      maxDeliveryDistance: $maxDeliveryDistance,
      photoList: $photoList
      crossBoundaryBusiness: $crossBoundaryBusiness
      lat: $lat
      lng: $lng
    ) {
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
      businessFax
      businessEmail
      logo
      businessHours {
        weekDay
        time
      }
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
      homePageVisit
      crossBoundaryBusiness
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

export const UPDATE_SAVED_FLYER = gql`
  mutation($input: FlyerUpdateInput!) {
    updateSavedFlyer(input: $input) {
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
