const mutations = {
  setActiveFlyerList: (state, payload) => {
    state.activeFlyerList = payload;
    console.log(state.activeFlyerList )
  },

  setAuthError: (state, payload) => {
    state.authError = payload;
  },

  setAllItemCatalog: (state, payload) => {
    state.allItemsCatalog = payload;
    //  console.log(state.allItemsCatalog)
  },

  setAllGuildDeals: (state, payload) => {
    state.allGuildDeals = payload
    console.log(state.allGuildDeals)
  },

  setCityHall: (state, payload) => {
    console.log(state.cityHall)
    state.cityHall = payload
  },

  setClientPageView: (state, payload) => {
    state.clientPageView = payload;
  },

  setClientPreviewLoading: (state, payload) => {
    state.clientPreviewLoading = payload;
    // console.log(state.vendorHomeLoading)
  },

  setCommitGuildDealLoading:(state, payload) => {
    state.commitGuildDealLoading = payload
  },

  setCustomerRatings: (state, payload) => {
    state.customerRatings = payload
  },

  setDemandSearch: (state, payload) => {
    state.demandSearch = payload;
  },

  setError: (state, payload) => {
    state.error = payload;
    // console.log(state.error);
    // console.log(state.error.message);
  },

  setEventCategory: (state, payload) => {
    state.eventCategory = payload
  },

  setFlyerList: (state, payload) => {
    state.savedFlyerList = payload;
  },

  setFlyerFormatType: (state, payload) => {
    state.flyerFormatType = payload;
  },

  setFingerPrint: (state, payload) => {
    state.fingerPrint = payload;
    // console.log(state.fingerPrint);
  },

  setFingerPrintIsSaved: (state, payload) => {
    state.fingerPrintIsSaved = payload;
  },

  setFooterHeight: (state, payload) => {
    state.footerHeight = payload
    // console.log('footerHeight', state.footerHeight)
  },

  setGamePropList: (state, payload) => {
    // console.log(payload)
    state.gamePropList = payload
  },

  setGameSubstituteList: (state, payload) => {
    state.gameSubstituteList = payload
  },

  setVendorList: (state, payload) => {
    state.vendorList = payload;
    // console.log(state.vendorList)
  },

  setGuilds: (state, payload) => {
    state.guilds = payload
    // console.log(state.guilds)
  },

  setGuildChatMessages: (state, payload) => {
    // console.log(state.guildChatMessages)
    state.guildChatMessages = payload
  },

  setGuildDeals: (state, payload) => {
    state.guildDeals = payload
    console.log(state.guildDeals)
  },

  setGuildDealsStatus: (state, payload) => {
    state.guildDealsStatus = payload
    console.log(state.guildDealsStatus )
  },


  setGuildLogos: (state, payload) => {
    state.guildLogos = payload
  },

  setInDesign: (state, payload) => {
    state.inDesign = payload;
  },

  setIsPromotionEventShowed: (state, payload) => {
    state.isPromotionEventShowed = payload
  },

  setIsSearchBtnDisabled: (state, payload) => {
    state.isSearchBtnDisabled = payload
  },

  setItemCatalogUpdated: (state, payload) => {
    state.itemCatalogUpdated = payload;
  },

  setItemCatalogSaved: (state, payload) => {
    state.itemCatalogSaved = payload;
    //  console.log(state.itemCatalogSaved)
  },
  setItemCatalogLoading: (state, payload) => {
    state.itemCatalogLoading = payload;
  },

  setLoading: (state, payload) => {
    state.loading = payload;
    console.log('loading',state.loading)
  },

  setMarkerList: (state, payload) => {
    state.markerList = payload
    // console.log(state.markerList)
  },

  setMetroSpec: ( state, payload) => {
    state.metroSpec = payload
    // console.log(state.metroSpec)
  },

  setMergeIsDone:(state, payload) => {
    state.mergeIsDone = payload
  },

  setNavbarHeight: (state, payload) => {
    state.navbarHeight = payload;
    // console.log('navBarHeight', state.navbarHeight)
  },

  setNews: (state, payload) => {
    state.news = payload
    console.log(state.news)
  },

  setPets: (state, payload) => {
    state.pets = payload;
  },

  setPlaceOrderLoading: (state, payload) => {
    state.placeOrderLoading = payload
  },

  setPromotionEvents: (state, payload) => {
    state.promotionEvents = payload;
    // console.log(state.promotionEvents)
  },

  setPromotionEventsProcessed: (state, payload) => {
    state.promotionEventsProcessed = payload
    // console.log(state.promotionEventsProcessed)

  },

  setPagePreview: (state, payload) => {
    state.pagePreview = payload;
    //  console.log(state.pagePreview);
  },
  setPagePreview_C: (state, payload) => {
    state.pagePreview_C = payload;
    //  console.log(state.pagePreview_C);
  },
  setProductsCategories: (state, payload) => {
    state.productsCategories = payload;
  },

  setRestaurantCategories: (state, payload) => {
    state.restaurantCategories = payload;
    // console.log(state.restaurantCategories)
  },

  setResident: (state, payload) => {
    state.resident = payload;
    // console.log('resident in mutation',state.resident)
  },

  setResidentOrders: (state, payload) => {
    state.residentOrders = payload
    console.log(state.residentOrders)
  },

  setRewardItems: (state, payload) => {
    state.rewardItems = payload;
    // console.log(state.rewardItems)
  },

  setSelectedTemplate: (state, payload) => {
    state.selectedTemplate = payload;
  },
  setSelectedTemplate_C: (state, payload) => {
    state.selectedTemplate_C = payload;
    //  console.log(state.selectedTemplate_C)
  },

  setSelectedSketch: (state, payload) => {
    state.selectedSketch = payload;
    //  console.log(state.selectedSketch);
  },
  setSelectedSketch_C: (state, payload) => {
    state.selectedSketch_C = payload;
    //  console.log(state.selectedSketch_C);
  },

  setSavedFlyer: (state, payload) => {
    state.savedFlyer = payload;
  },

  setSaveShoppingCartLoading: (state, payload) => {
    state.saveShoppingCartLoading = payload
  },

  setShoppingCart: (state, payload) => {
    state.shoppingCart = payload
    // console.log(state.shoppingCart)
  },

  setSimpleFlyer: (state, payload) => {
    state.simpleFlyer.push(payload);
    // console.log(state.simpleFlyer);
  },

  setSingleItemRating: (state, payload) => {
    state.singleItemRating = payload
    // console.log(state.singleItemRating)
  },

  setSearchCouponLoading: (state, payload) => {
    state.searchCouponLoading = payload
  },

  setServicesCategories: (state, payload) => {
    state.servicesCategories = payload;
  },

  setSketchList: (state, payload) => {
    state.sketchList = payload;
  },
  

  setSoughtDeals: (state, payload) => {
    state.soughtDeals = payload
  },

  setTargetDistributeNumber: (state, payload) => {
    state.targetDistributeNumber = payload
  },

  setTemplateList: (state, payload) => {
    state.templateList = payload;
  },

  setTemplateIsSaved: (state, payload) => {
    state.templateIsSaved = payload;
  },

  setVendor: (state, payload) => {
    state.vendor = payload;
     console.log(state.vendor);
  },

  setVendorHomeLoading: (state, payload) => {
    state.vendorHomeLoading = payload;
    // console.log(state.vendorHomeLoading)
  },

  setVendorFlyers: (state, payload) => {
    console.log(state.vendorFlyers )
    state.vendorFlyers = payload
  },

  setVendorProfileLoading: (state, payload) => {
    state.vendorProfileLoading = payload;
    // console.log(state.vendorHomeLoading)
  },

  setVendorOrders: (state, payload) => {
    state.vendorOrders = payload
    console.log(state.vendorOrders)
  },

  setVendorSalesInfo: (state, payload) => {
    state.vendorSalesInfo = payload
  },

  setVendorSettlementRecords: (state, payload) => {
    state.vendorSettlementRecords = payload
    console.log(state.vendorSettlementRecords)
  },

  setVendorPromotionEvents: (state, payload) => {
    state.vendorPromotionEvents = payload
    console.log(state.vendorPromotionEvents)
  },

  setVendorInterface: (state, payload) => {
    state.vendorInterface = payload
    // console.log(state.vendorInterface)
  },

  setViewPortDimension: (state, payload) => {
    state.viewPortDimension = payload
    // console.log(state.viewPortDimension)
  },

  clearError: (state) => (state.error = null),
  clearResident: (state) => (state.resident = null),
  clearVendor: (state) => (state.vendor = null),
  clearSimpleFlyer: (state) => (state.simpleFlyer = null),
  clearPagePreview: (state) => (state.pagePreview = []),
  clearPagePreview_C: (state) => (state.pagePreview_C = null),
  clearSelectedSketch: (state) => (state.selectedSketch = null),
  clearSelectedTemplate: (state) => (state.selectedTemplate = null),
  clearSelectedSketch_C: (state) => (state.selectedSketch_C = null),
  clearSelectedTemplate_C: (state) => (state.selectedTemplate_C = null),
  clearClientPageView: (state) => (state.clientPageView = null),
};

export default mutations;
