/**
 * Vuex mutations, now Pinia actions (Phase 4c).
 *
 * Pinia has no mutations — actions mutate state directly — so each of these
 * became a method taking just the payload, with state.x written as this.x.
 * The names are unchanged, which is what let the 149 commit() call sites be
 * rewritten mechanically.
 *
 * They stay in their own file, separate from actions.js, because the split is
 * still meaningful: these are synchronous state writes, actions.js is the
 * Apollo layer.
 */
const mutations = {
  setActiveFlyerList(payload) {
    this.activeFlyerList = payload;
    console.log(this.activeFlyerList )
  },

  setAuthError(payload) {
    this.authError = payload;
  },

  setAllItemCatalog(payload) {
    this.allItemsCatalog = payload;
    //  console.log(this.allItemsCatalog)
  },

  setAllGuildDeals(payload) {
    this.allGuildDeals = payload
    console.log(this.allGuildDeals)
  },

  setCityHall(payload) {
    console.log(this.cityHall)
    this.cityHall = payload
  },

  setClientPageView(payload) {
    this.clientPageView = payload;
  },

  setClientPreviewLoading(payload) {
    this.clientPreviewLoading = payload;
    // console.log(this.vendorHomeLoading)
  },

  setCommitGuildDealLoading(payload) {
    this.commitGuildDealLoading = payload
  },

  setCustomerRatings(payload) {
    this.customerRatings = payload
  },

  setDemandSearch(payload) {
    this.demandSearch = payload;
  },

  setError(payload) {
    this.error = payload;
    // console.log(this.error);
    // console.log(this.error.message);
  },

  setEventCategory(payload) {
    this.eventCategory = payload
  },

  setFlyerList(payload) {
    this.savedFlyerList = payload;
  },

  setFlyerFormatType(payload) {
    this.flyerFormatType = payload;
  },

  setFingerPrint(payload) {
    this.fingerPrint = payload;
    // console.log(this.fingerPrint);
  },

  setFingerPrintIsSaved(payload) {
    this.fingerPrintIsSaved = payload;
  },

  setFooterHeight(payload) {
    this.footerHeight = payload
    // console.log('footerHeight', this.footerHeight)
  },

  setGamePropList(payload) {
    // console.log(payload)
    this.gamePropList = payload
  },

  setGameSubstituteList(payload) {
    this.gameSubstituteList = payload
  },

  setVendorList(payload) {
    this.vendorList = payload;
    // console.log(this.vendorList)
  },

  setGuilds(payload) {
    this.guilds = payload
    // console.log(this.guilds)
  },

  setGuildChatMessages(payload) {
    // console.log(this.guildChatMessages)
    this.guildChatMessages = payload
  },

  setGuildDeals(payload) {
    this.guildDeals = payload
    console.log(this.guildDeals)
  },

  setGuildDealsStatus(payload) {
    this.guildDealsStatus = payload
    console.log(this.guildDealsStatus )
  },


  setGuildLogos(payload) {
    this.guildLogos = payload
  },

  setInDesign(payload) {
    this.inDesign = payload;
  },

  setIsPromotionEventShowed(payload) {
    this.isPromotionEventShowed = payload
  },

  setIsSearchBtnDisabled(payload) {
    this.isSearchBtnDisabled = payload
  },

  setItemCatalogUpdated(payload) {
    this.itemCatalogUpdated = payload;
  },

  setItemCatalogSaved(payload) {
    this.itemCatalogSaved = payload;
    //  console.log(this.itemCatalogSaved)
  },
  setItemCatalogLoading(payload) {
    this.itemCatalogLoading = payload;
  },

  setLoading(payload) {
    this.loading = payload;
    console.log('loading',this.loading)
  },

  setMarkerList(payload) {
    this.markerList = payload
    // console.log(this.markerList)
  },

  setMetroSpec(payload) {
    this.metroSpec = payload
    // console.log(this.metroSpec)
  },

  setMergeIsDone(payload) {
    this.mergeIsDone = payload
  },

  setNavbarHeight(payload) {
    this.navbarHeight = payload;
    // console.log('navBarHeight', this.navbarHeight)
  },

  setNews(payload) {
    this.news = payload
    console.log(this.news)
  },

  setPets(payload) {
    this.pets = payload;
  },

  setPlaceOrderLoading(payload) {
    this.placeOrderLoading = payload
  },

  setPromotionEvents(payload) {
    this.promotionEvents = payload;
    // console.log(this.promotionEvents)
  },

  setPromotionEventsProcessed(payload) {
    this.promotionEventsProcessed = payload
    // console.log(this.promotionEventsProcessed)

  },

  setPagePreview(payload) {
    this.pagePreview = payload;
    //  console.log(this.pagePreview);
  },
  setPagePreview_C(payload) {
    this.pagePreview_C = payload;
    //  console.log(this.pagePreview_C);
  },
  setProductsCategories(payload) {
    this.productsCategories = payload;
  },

  setRestaurantCategories(payload) {
    this.restaurantCategories = payload;
    // console.log(this.restaurantCategories)
  },

  setResident(payload) {
    this.resident = payload;
    // console.log('resident in mutation',this.resident)
  },

  setResidentOrders(payload) {
    this.residentOrders = payload
    console.log(this.residentOrders)
  },

  setRewardItems(payload) {
    this.rewardItems = payload;
    // console.log(this.rewardItems)
  },

  setSelectedTemplate(payload) {
    this.selectedTemplate = payload;
  },
  setSelectedTemplate_C(payload) {
    this.selectedTemplate_C = payload;
    //  console.log(this.selectedTemplate_C)
  },

  setSelectedSketch(payload) {
    this.selectedSketch = payload;
    //  console.log(this.selectedSketch);
  },
  setSelectedSketch_C(payload) {
    this.selectedSketch_C = payload;
    //  console.log(this.selectedSketch_C);
  },

  setSavedFlyer(payload) {
    this.savedFlyer = payload;
  },

  setSaveShoppingCartLoading(payload) {
    this.saveShoppingCartLoading = payload
  },

  setShoppingCart(payload) {
    this.shoppingCart = payload
    // console.log(this.shoppingCart)
  },

  setSimpleFlyer(payload) {
    this.simpleFlyer.push(payload);
    // console.log(this.simpleFlyer);
  },

  setSingleItemRating(payload) {
    this.singleItemRating = payload
    // console.log(this.singleItemRating)
  },

  setSearchCouponLoading(payload) {
    this.searchCouponLoading = payload
  },

  setServicesCategories(payload) {
    this.servicesCategories = payload;
  },

  setSketchList(payload) {
    this.sketchList = payload;
  },
  

  setSoughtDeals(payload) {
    this.soughtDeals = payload
  },

  setTargetDistributeNumber(payload) {
    this.targetDistributeNumber = payload
  },

  setTemplateList(payload) {
    this.templateList = payload;
  },

  setTemplateIsSaved(payload) {
    this.templateIsSaved = payload;
  },

  setVendor(payload) {
    this.vendor = payload;
     console.log(this.vendor);
  },

  setVendorHomeLoading(payload) {
    this.vendorHomeLoading = payload;
    // console.log(this.vendorHomeLoading)
  },

  setVendorFlyers(payload) {
    console.log(this.vendorFlyers )
    this.vendorFlyers = payload
  },

  setVendorProfileLoading(payload) {
    this.vendorProfileLoading = payload;
    // console.log(this.vendorHomeLoading)
  },

  setVendorOrders(payload) {
    this.vendorOrders = payload
    console.log(this.vendorOrders)
  },

  setVendorSalesInfo(payload) {
    this.vendorSalesInfo = payload
  },

  setVendorSettlementRecords(payload) {
    this.vendorSettlementRecords = payload
    console.log(this.vendorSettlementRecords)
  },

  setVendorPromotionEvents(payload) {
    this.vendorPromotionEvents = payload
    console.log(this.vendorPromotionEvents)
  },

  setVendorInterface(payload) {
    this.vendorInterface = payload
    // console.log(this.vendorInterface)
  },

  setViewPortDimension(payload) {
    this.viewPortDimension = payload
    // console.log(this.viewPortDimension)
  },

  clearError() {
    this.error = null;
  },
  clearResident() {
    this.resident = null;
  },
  clearVendor() {
    this.vendor = null;
  },
  clearSimpleFlyer() {
    this.simpleFlyer = null;
  },
  clearPagePreview() {
    this.pagePreview = [];
  },
  clearPagePreview_C() {
    this.pagePreview_C = null;
  },
  clearSelectedSketch() {
    this.selectedSketch = null;
  },
  clearSelectedTemplate() {
    this.selectedTemplate = null;
  },
  clearSelectedSketch_C() {
    this.selectedSketch_C = null;
  },
  clearSelectedTemplate_C() {
    this.selectedTemplate_C = null;
  },
  clearClientPageView() {
    this.clientPageView = null;
  },
};

export default mutations;
