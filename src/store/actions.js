/**
 * The Apollo layer, now Pinia actions (Phase 4c).
 *
 * Vuex handed actions a context object; Pinia gives them the store as this.
 * So ({ commit, state }, payload) became (payload), commit("setX", v) became
 * this.setX(v) — setX being one of the former mutations, now an action too —
 * and state.x became this.x.
 *
 * Nothing about the Apollo calls themselves changed.
 */
// Phase 4c: the Apollo client moved to its own module, so this no longer
// imports main.js — the cycle main -> store -> actions -> main is gone.
import { defaultClient as apolloClient } from "../apollo/client";
import _ from "lodash";

import {
  CHECK_SAVED_FINGERPRINT,
  GET_ACTIVE_FLYER,
  GET_ALL_ITEM_CATALOG,
  GET_ALL_GUILDS,
  GET_ALL_GUILD_DEALS,
  GET_CURRENT_RESIDENT,
  GET_EVENT_CATEGORY,
  GET_ITEM_CATALOG,
  GET_METRO_SPEC,
  GET_NEWS,
  GET_PETS,
  GET_PROMOTION_EVENTS,
  GET_PRODUCTS_CATEGORIES,
  GET_SERVICES_CATEGORIES,
  GET_RESTAURANT_CATEGORIES,
  GET_REWARD_ITEMS,
  GET_CITYHALL,
  GET_CURRENT_VENDOR,
  GET_CUSTOMER_RATINGS,
  GET_GAME_PROP_LIST,
  GET_GAME_SUBSTITUTE_LIST,
  GET_GUILD_CHAT_MESSAGES,
  GET_GUILD_LOGOS,
  GET_GUILD_DEALS_STATUS,
  GET_RESIDENT_ORDERS,
  GET_SKETCH_LIST,
  GET_SELECTED_SKETCH,
  GET_SHOPPING_CART,
  GET_TEMPLATE_LIST,
  GET_SELECTED_TEMPLATE,
  GET_SELECTED_FLYER_CLIENT_VIEW,
  GET_SINGLE_ITEM_RATING,
  GET_FLYER_LIST,
  GET_VENDOR_FLYERS,
  GET_VENDOR_GUILD_DEALS,
  GET_VENDOR_LIST,
  GET_VENDOR_ORDERS,
  GET_VENDOR_SALES_INFO,
  GET_VENDOR_SETTLEMENT_RECORDS,
  GET_VENDOR_PROMOTION_EVENTS,
  GET_VENDOR_INTERFACE,
  SEARCH_AVAILABLE_DEALS,
  SET_UP_FLYER,
} from "../queries/queries_query";

import {
  DISTRIBUTE_FLYER,
  COMMIT_GUILD_DEALS,
  CREATE_PROMOTION_EVENT,
  FEED_PET,
  JOIN_GUILD,
  PLACE_ORDER,
  QUIT_GUILD,
  SAVE_CUSTOMER_RATING,
  SAVE_SKETCH,
  SAVE_TEMPLATE,
  SAVE_FLYER,
  SAVE_ITEM_CATALOG,
  SAVE_SHOPPING_CART,
  SAVE_GUILD_DEALS,
  SAVE_SINGLE_ITEM_RATING,
  SAVE_SUBSTITUTE_ITEMS,
  SEND_MESSAGE,
  SIGNUP_RESIDENT,
  SIGNIN_RESIDENT,
  SIGNUP_VENDOR,
  SIGNIN_VENDOR,
  START_GUILD,
  STASH_FLYER,
  TARGET_DISTRIBUTE,
  TOGGLE_GUILD_DEAL_ACTIVE,
  UPDATE_AVATAR,
  UPDATE_MONSTER_CHEST,
  UPDATE_PROFILE,
  UPDATE_VENDOR_PROFILE,
  UPDATE_SAVED_FLYER,
  UPDATE_SHOPPING_CART
} from "../queries/queries_mutation";


const actions = {

  checkSavedFingerPrint(payload) {
    apolloClient
      .query({
        query: CHECK_SAVED_FINGERPRINT,
        variables: payload,
      })
      .then(({
        data
      }) => {
        this.setFingerPrintIsSaved(data.checkSavedFingerPrint.fingerPrintIsSaved);
        // if ((localStorage.getItem('token') || localStorage.getItem('vendortoken')) && !data.checkSavedFingerPrint.fingerPrintIsSaved) {
        //   this.clearResident();
        //   this.clearVendor();
        //   localStorage.clear();
        //   apolloClient.resetStore();
        //   this.router.push("/");
        // }
      });
  },

commitGuildDeals(payload) {
  this.setCommitGuildDealLoading(true)
  apolloClient
    .mutate({
      mutation: COMMIT_GUILD_DEALS,
      variables: payload,
      update:(cache,{data:{commitGuildDeals}}) => {
        console.log(payload)
        console.log(commitGuildDeals)
      //  const  data = cache.readQuery({query: GET_GUILD_DEALS_STATUS, variables: {guildFullName: payload.guildFullName}})
        //  data.getGuildDealsStatus.length = 0
        //  data.getGuildDealsStatus = [...commitGuildDeals]
         this.setGuildDealsStatus(commitGuildDeals)
      }
    })
    .then(({data}) => {
      const { commitGuildDeals } = data
      this.setGuildDealsStatus(commitGuildDeals)
      this.setCommitGuildDealLoading(false)

    })
    .catch(err => {
      console.error(err)
      this.setCommitGuildDealLoading(false)
    })

 },

 createPromotionEvent(payload) {
  console.log(payload)
    apolloClient
      .mutate({
        mutation: CREATE_PROMOTION_EVENT,
        variables: payload,
        update:(cache,{})=>{
          console.log(payload)
          const list = [...this.news]
            console.log(list)
            const newsTitle = `(${payload.input.vendorName}) ${payload.input.eventType}: `
            const headLine = `${payload.input.eventTitle}   From: ${payload.input.dateFrom} To: ${payload.input.dateTo}`
            list.push({
            newsTitle,
            headLine,
            date: Date.now().toString()
          })
          // data.getNews.push(callGroupPurchase)
          // cache.writeQuery({query: GET_NEWS, data})
          this.setNews(list)
        }
      })
      .then(({data}) => {
        const { createPromotionEvent } = data
        // console.log(createPromotionEvent)
        this.setPromotionEvents(createPromotionEvent)
      })
      .catch(err => console.error(err))
 },

  distributeFlyer(payload) {
    this.setLoading(true);
    apolloClient
      .mutate({
        mutation: DISTRIBUTE_FLYER,
        variables: payload,
      })
      .then(({
        data
      }) => {
        const {
          flyerId
        } = data.distributeFlyer;
        const indexOfList = _.findIndex(this.savedFlyerList, (item) => {
          return item.flyerId == flyerId;
        });
        this.savedFlyerList[indexOfList].distributed = true;
        // console.log(data);
        this.setLoading(false);
        this.router.push("/");
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  targetDistribute(payload) {
    this.setLoading(true);
    apolloClient
      .mutate({
        mutation: TARGET_DISTRIBUTE,
        variables: payload,
      })
      .then(({
        data
      }) => {
        const {
          flyerId
        } = data.targetDistribute;
        const indexOfList = _.findIndex(this.savedFlyerList, (item) => {
          return item.flyerId == flyerId;
        });
        this.savedFlyerList[indexOfList].distributed = true;
        // console.log(data);
        this.setLoading(false);
        this.router.push("/");
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  feedPet(payload) {
    // console.log(payload)
    apolloClient
      .mutate({
        mutation: FEED_PET,
        variables: payload,
        update:(cache, {data: { feedPet }}) => {
          console.log(feedPet)
          // Apollo Client 3 freezes what readQuery returns, so this rebuilds
          // the resident rather than mutating it in place the way Apollo 2
          // allowed. Same end state, no writes to frozen objects.
          const cached = cache.readQuery({ query: GET_CURRENT_RESIDENT })
          const current = cached.getCurrentResident

          const flyersFedToPet = current.flyersFedToPet
            ? [...current.flyersFedToPet, payload.flyerId]
            : [payload.flyerId]

          let stashedFlyers = current.stashedFlyers
          if (stashedFlyers && stashedFlyers.length > 0 && payload.stashOrActive == 'Stash') {
            const index = _.findIndex(stashedFlyers, flyer => {
                return payload.flyerId == flyer.flyerId
            })
            if (index >= 0) {
              stashedFlyers = stashedFlyers.filter((_flyer, i) => i !== index)
            }
          }

          let guild = current.guild
          let silverCoins = current.silverCoins
          if (guild) {
            const guildCut = payload.silverRewarded * guild.contributionRatio
            guild = {...guild, guildSilver: guild.guildSilver + guildCut}
            silverCoins += (payload.silverRewarded - guildCut)
          } else {
            silverCoins += payload.silverRewarded
          }

          cache.writeQuery({
            query: GET_CURRENT_RESIDENT,
            data: {
              getCurrentResident: {
                ...current,
                flyersFedToPet,
                stashedFlyers,
                guild,
                silverCoins,
                petExperience: current.petExperience + payload.petExperienceGained,
              },
            },
          });
          this.setResident(feedPet)
        }
      })
      .then(({data}) => {
        const { feedPet } = data
        // console.log(feedPet)
        // this.setResident(feedPet)
      })
      .catch(err => console.error(err))
  },

  getActiveFlyer() {
    // console.log("getactiveflyer")
    apolloClient
      .query({
        query: GET_ACTIVE_FLYER,
      })
      .then(({
        data
      }) => {
        // console.log(data.getActiveFlyer);
        this.setActiveFlyerList(data.getActiveFlyer);
        // localStorage.setItem('resident', JSON.stringify(data.getCurrentResident));
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getAllItemsCatalog(payload) {
    this.setLoading(true);
    apolloClient
      .query({
        query: GET_ALL_ITEM_CATALOG,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // console.log(data)
        this.setAllItemCatalog(data.getAllItemsCatalog);
        this.setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        this.setLoading(false);
      });
  },

  getAllGuilds() {
    apolloClient
      .query({query: GET_ALL_GUILDS})
      .then(({data}) => {
        const { getAllGuilds } = data
        this.setGuilds(getAllGuilds)
      })
      .catch(err => console.error(err))
  },

  getAllGuildDeals() {
    apolloClient
      .query({query: GET_ALL_GUILD_DEALS})
      .then(({data}) => {
        const {getAllGuildDeals} = data
        this.setAllGuildDeals(getAllGuildDeals)
      })
      .catch(err => console.error(err))
  },

  getCityHall() {
    apolloClient
      .query({query: GET_CITYHALL})
      .then(({data})=>{
        const {getCityHall} = data
        console.log(getCityHall)
        this.setCityHall(getCityHall)
      })
      .catch(err => console.error(err))
  },

  getCurrentResident() {
    // console.log("this is done")
    this.setLoading(true);
    apolloClient
      .query({
        query: GET_CURRENT_RESIDENT,
      })
      .then(({
        data
      }) => {
        console.log(data);
        this.setLoading(false);
        this.setResident(data.getCurrentResident);
        // localStorage.setItem('resident', JSON.stringify(data.getCurrentResident));
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  getCurrentVendor() {
    // console.log("this is done")
    this.setLoading(true);
    apolloClient
      .query({
        query: GET_CURRENT_VENDOR,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        this.setLoading(false);
        this.setVendor(data.getCurrentVendor);
        // localStorage.setItem('resident', JSON.stringify(data.getCurrentResident));
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  getCustomerRatings(payload) {
    apolloClient
      .query({
        query: GET_CUSTOMER_RATINGS,
        variables: payload
      })
      .then(({data}) => {
        const { getCustomerRatings } = data
        // console.log(getCustomerRatings)
        this.setCustomerRatings(getCustomerRatings)
      })
      .catch( err => console.error(err))
  },

  getGamePropList() {
    apolloClient
      .query({
        query: GET_GAME_PROP_LIST,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        this.setGamePropList(data.getGamePropList);
      })
      .catch((err) => {
        console.error(err);
      });
  },


  getGameSubstituteList() {
    apolloClient
      .query({
        query: GET_GAME_SUBSTITUTE_LIST,
      })
      .then(({
        data
      }) => {
        console.log(data);
        this.setGameSubstituteList(data.getGameSubstituteList);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getGuildLogos() {
    apolloClient
      .query({query: GET_GUILD_LOGOS})
      .then(({data}) => {
        const { getGuildLogos } = data
        this.setGuildLogos(getGuildLogos)
      })
      .catch(err => console.error(err))
  },

  getGuildChatMessages(payload) {
    apolloClient
      .query({
        query: GET_GUILD_CHAT_MESSAGES,
        variables: payload
      })
      .then(({data}) => {
        // console.log(data)
        const { getGuildChatMessages } = data
        // console.log(getGuildChatMessages)
        this.setGuildChatMessages(getGuildChatMessages)
      })
      .catch(err => console.error(err))
  },

  getGuildDealsStatus(payload) {
    console.log(payload)
    apolloClient
      .query({
        query: GET_GUILD_DEALS_STATUS,
        variables: payload
      })
      .then(({data}) => {
        const { getGuildDealsStatus } = data
        console.log(getGuildDealsStatus)
        this.setGuildDealsStatus(getGuildDealsStatus)
      })
      .catch(err => console.error(err))
  },

  getItemCatalog(payload) {
    // console.log('getItemCatalog')
    this.setItemCatalogLoading(true);
    apolloClient
      .query({
        query: GET_ITEM_CATALOG,
        variables: payload,
      })
      .then(({
        data
      }) => {
        console.log(data.getItemCatalog);
        if (data.getItemCatalog.length > 0) {
          // const {
          //   subcategory,
          //   itemDetailed
          // } = data.getItemCatalog;
          // let  itemCodesOnSale = []
          // console.log(this.vendorPromotionEvents)
          // this.vendorPromotionEvents.map(event => {
          //   console.log(event.promotionItems)
          //   itemCodesOnSale = [...itemCodesOnSale, ...event.promotionItems]
          // })
          // console.log(itemCodesOnSale)
          // const newItemCatalogSaved = data.getItemCatalog.map((item) => {
          //   const itemFiltered = _.pick(item, [
          //     "subcategory",
          //     "itemCode",
          //     "description",
          //     "specification",
          //     "rewardSilver",
          //     "photo",
          //     "unit",
          //     "rate",
          //     "promoRate",
          //     "active",
          //   ]);
          //   console.log(itemFiltered)
          //   if(itemCodesOnSale.includes(itemFiltered.itemCode)) {
          //     return {...itemFiltered, ...{event: "Yes"}}
          //   } else {
          //     return {...itemFiltered, ...{event: "No"}}
          //   }

          // });
          this.setItemCatalogSaved({
            subcategory: data.getItemCatalog[0].subcategory,
            itemDetailed: [...data.getItemCatalog]
          });
          this.setItemCatalogLoading(false);
        } else {
          this.setItemCatalogLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        this.setItemCatalogLoading(false);
      });
  },

  getMetroSpec() {
    apolloClient
      .query({ query: GET_METRO_SPEC})
      .then(({data}) => {
        
        const { getMetroSpec } =  data 
        console.log(getMetroSpec )
        this.setMetroSpec(getMetroSpec)
      })
      .catch(err => console.error(err))
  },

  getNews() {
    apolloClient
      .query({ query: GET_NEWS})
      .then(({data}) => {
        const { getNews } = data
        this.setNews(getNews)
      })
      .catch(err => console.error(err))
  },

  getPets() {
    apolloClient
      .query({
        query: GET_PETS,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        this.setPets(data.getPets);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getPromotionEvents() {
    apolloClient
      .query({
        query: GET_PROMOTION_EVENTS,
      })
      .then(({data}) => {
        const { getPromotionEvents } = data
        this.setPromotionEvents(getPromotionEvents)
      })
      .catch(err => console.error(err))
  },

  getEventCategory() {
    apolloClient
    .query({
      query: GET_EVENT_CATEGORY,
    })
    .then(({data}) => {
      // console.log(data.getPromotionEvents);
      this.setEventCategory(data.getEventCategory);
    })
    .catch((err) => {
      console.log(err)
    })
  },

  getResidentOrders(payload) {
    apolloClient
      .query({
        query: GET_RESIDENT_ORDERS,
        variables: payload
      })
      .then(({data}) => {
        const { getResidentOrders } = data
        this.setResidentOrders(getResidentOrders)
        console.log('getResidentOrder', getResidentOrders)
      })
      .catch(err => console.error(err))
  },

  getRewardItems() {
    apolloClient
    .query({
      query: GET_REWARD_ITEMS
    })
    .then(({data}) => {
      this.setRewardItems(data.getRewardItems)
    })
    .catch((err) => {
      console.log(err)
    })
  },

  getSelectedSketch(payload) {
    this.setVendorHomeLoading(true);
    apolloClient
      .query({
        query: GET_SELECTED_SKETCH,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        const {
          type
        } = data.getSelectedSketch;
        this[
          type == "FLYERCOUPON" ? "setSelectedSketch_C" : "setSelectedSketch"
        ](data.getSelectedSketch);
        this.setVendorHomeLoading(false);
        this.router.push("/vendorflyers/2");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getSelectedTemplate(payload) {
    this.setVendorHomeLoading(true);
    apolloClient
      .query({
        query: GET_SELECTED_TEMPLATE,
        variables: payload,
      })
      .then(({
        data
      }) => {
        console.log(data);
        const {
          type
        } = data.getSelectedTemplate;
        this[
          type == "FLYERCOUPON" ?
          "setSelectedTemplate_C" :
          "setSelectedTemplate"
        ](data.getSelectedTemplate);
        this.setVendorHomeLoading(false);
        this.router.push("/vendorflyers/2");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getSelectedFlyerClientView(payload) {
    this.setClientPreviewLoading(true);
    apolloClient
      .query({
        query: GET_SELECTED_FLYER_CLIENT_VIEW,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // console.log(data.getSelectedFlyerClientView);
        this.setClientPageView(data.getSelectedFlyerClientView);
        this.setClientPreviewLoading(false);
      })
      .catch((err) => {
        this.setClientPreviewLoading(false);
        console.log(err);
      });
  },

  getShoppingCart(payload) {
    apolloClient
      .query({
        query: GET_SHOPPING_CART,
        variables: payload
      })
      .then(({data}) => {
        const { getShoppingCart } = data
        this.setShoppingCart(getShoppingCart)
      })
      .catch(err => console.error(err))
  },

  getSingleItemRating(payload) {
    apolloClient
      .query({
        query: GET_SINGLE_ITEM_RATING,
        variables: payload
      })
      .then(({ data }) => {
        const {getSingleItemRating} = data
        this.setSingleItemRating(getSingleItemRating)
      })
      .catch(err => console.error(err))
  },

  getSketchList(payload) {
    apolloClient
      .query({
        query: GET_SKETCH_LIST,
        variables: payload,
      })
      .then(({
        data
      }) => {
        console.log(data);
        if (data.getSketchList) {
          this.setSketchList(data.getSketchList);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getFlyerList(payload) {
    this.setLoading(true)
    apolloClient
      .query({
        query: GET_FLYER_LIST,
        variables: payload,
      })
      .then(({
        data
      }) => {
        console.log(data);
        if (data.getFlyerList) {
          this.setFlyerList(data.getFlyerList);
          this.setLoading(false)
        }
      })
      .catch((err) => {
        console.error(err);
        this.setLoading(false)
      });
  },

  getTemplateList(payload) {
    apolloClient
      .query({
        query: GET_TEMPLATE_LIST,
        variables: payload,
      })
      .then(({
        data
      }) => {
        console.log(data);
        if (data.getTemplateList) {
          this.setTemplateList(data.getTemplateList);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getProductCategory() {
    // console.log("signup vendor")
    apolloClient
      .query({
        query: GET_PRODUCTS_CATEGORIES,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        this.setProductsCategories(data.getProductCategory);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getServiceCategory() {
    apolloClient
      .query({
        query: GET_SERVICES_CATEGORIES,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        this.setServicesCategories(data.getServiceCategory);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getRestaurantCategory() {
    apolloClient
      .query({
        query: GET_RESTAURANT_CATEGORIES,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        this.setRestaurantCategories(// Apollo Client 3 freezes query results, so sort a copy.
          [...data.getRestaurantCategory.items].sort()
        );
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getVendorFlyers(payload) {
    apolloClient
      .query({
        query: GET_VENDOR_FLYERS,
        variables: payload
      })
      .then(({data})=> {
        const { getVendorFlyers } = data
        this.setVendorFlyers(getVendorFlyers)
      })
      .catch(err=>console.error(err))
  },

  getVendorGuildDeals(payload) {
    apolloClient
      .query({
        query: GET_VENDOR_GUILD_DEALS,
        variables: payload
      })
      .then(({data}) => {
        const {getVendorGuildDeals} = data
        this.setGuildDeals(getVendorGuildDeals)
      })
      .catch(err => console.log(err))
  },

  getVendorList() {
    apolloClient
      .query( {query: GET_VENDOR_LIST})
      .then(({data})=>{
        const {getVendorList} = data
        this.setVendorList(getVendorList)
      })
      .catch(err => console.error(err))
  },

  getVendorOrders(payload) {
    this.setVendorHomeLoading(true)
    apolloClient
      .query({
        query: GET_VENDOR_ORDERS,
        variables: payload
      })
      .then(({data}) => {
        const { getVendorOrders } = data
        this.setVendorOrders(getVendorOrders)
        this.setVendorHomeLoading(false)
      })
      .catch(err => 
       {
         console.error(err)
        this.setVendorHomeLoading(false)
       } 
       )
  },

  getVendorSalesInfo(payload) {
    apolloClient
      .query({
        query: GET_VENDOR_SALES_INFO,
        variables: payload
      })
      .then(({data})=> {
        const { getVendorSalesInfo } = data
        this.setVendorSalesInfo(getVendorSalesInfo)
      })
      .catch(err => console.error(err))
  },

  getVendorSettlementRecords(payload) {
    apolloClient
      .query({
        query: GET_VENDOR_SETTLEMENT_RECORDS,
        variables: payload
      })
      .then(({data}) => {
        const { getVendorSettlementRecords } = data
        this.setVendorSettlementRecords(getVendorSettlementRecords)
      })
      .catch(err => console.error(err))
  },

  getVendorPromotionEvents(payload) {
    apolloClient
      .query({
        query: GET_VENDOR_PROMOTION_EVENTS,
        variables: payload
      })
      .then(({data}) => {
        const { getVendorPromotionEvents } = data
        this.setVendorPromotionEvents(getVendorPromotionEvents)
      })
      .catch(err => console.error(err))
  },

  getVendorInterface(payload) {
    this.setLoading(true)
    apolloClient
      .query({
        query: GET_VENDOR_INTERFACE,
        variables: payload
      })
      .then(({data}) => {
        const {getVendorInterface} = data
        // console.log(getVendorInterface)
        this.setVendorInterface(getVendorInterface)
        this.setCustomerRatings(getVendorInterface.customerRatings)
        this.setLoading(false)
      })
      .catch(err => {
        console.error(err)
        this.setLoading(false)
      })
  },

   joinGuild(payload) {
    apolloClient
      .mutate({
        mutation: JOIN_GUILD,
        variables: payload,
        update:(cache,{ data : { joinGuild }}) => {
          // const residentData = cache.readQuery({ query: GET_CURRENT_RESIDENT})
          // console.log(joinGuild)
          let newResident
          if(this.resident.guild == null) {
            newResident = this.resident
            newResident.guild = joinGuild
          } else {
              newResident = { ...this.resident, guild: joinGuild }
          // console.log(newResident)
          }
         
          this.setResident(newResident)
        },
        // refetchQueries: [{ query: GET_CURRENT_RESIDENT }, { query: GET_ALL_GUILDS }],
        // awaitRefetchQueries: true
      })
      .then(({data}) => {
        const {joinGuild} = data
        // console.log(this.resident)
        // console.log(this.guilds)
        // this.router.go()
        //  const newResident = { ...this.resident, ...{ guild: joinGuild}}
        //   console.log(newResident)
        //   this.setResident(newResident)
      })
      .catch(err => console.error(err))
  },

  placeOrder(payload) {
    this.setPlaceOrderLoading(true)
    apolloClient
      .mutate({
        mutation: PLACE_ORDER,
        variables: payload
      })
      .then(({data}) => {
        const { placeOrder} = data
        console.log(placeOrder)
        this.setResidentOrders(placeOrder)
       this.setPlaceOrderLoading(false)
      //  this.router.push({name: "vendorInterface", params: { vendor: placeOrder[0].rendor }} )
      // this.router.go(-3)
      this.router.go()

      })
      .catch(err => {
        console.error(err)
        this.setPlaceOrderLoading(false)
         }
        )
  },

  quitGuild(payload) {
    apolloClient
      .mutate({
        mutation: QUIT_GUILD,
        variables: payload,
        update:(cache,{ data : { quitGuild }}) => {
          const newResident = this.resident
          newResident.guild = null
          this.setResident(newResident)
        },
        // refetchQueries: [{ query: GET_CURRENT_RESIDENT }, { query: GET_ALL_GUILDS }],
        // awaitRefetchQueries: true
      })
      .then(({data})=> {
        console.log(data)
      })
      .catch(err => console.error(err))
  },

  saveCustomerRating(payload) {
    // console.log(payload)
    apolloClient
      .mutate({
        mutation: SAVE_CUSTOMER_RATING,
        variables: payload
      })
      .then(({data}) => {
        const { saveCustomerRating } = data
        // console.log(saveCustomerRating)
        this.setCustomerRatings(saveCustomerRating)
      })
      .catch(err => console.error(err))
  },

  saveGuildDeals(payload) {
    apolloClient
    .mutate({
      mutation: SAVE_GUILD_DEALS,
      variables: payload
    })
    .then(({data}) => {
      this.setGuildDeals(data.saveGuildDeals)
      this.router.go()
    })
    .catch(err => console.log(err))
  },

  saveSingleItemRating(payload) {
    apolloClient
      .mutate({
        mutation: SAVE_SINGLE_ITEM_RATING,
        variables: payload
      })
      .then(({data}) => {
        const { saveSingleItemRating } = data
        this.setSingleItemRating(saveSingleItemRating)
      })
      .catch(err => console.error(err))
  },

  saveSketch(payload) {
    this.setLoading(true);
    console.log("savesketch in store");
    apolloClient
      .mutate({
        mutation: SAVE_SKETCH,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // const index = this.userPosts.findIndex(
        //   post => post._id === data.updateUserPost._id
        // );
        // const resident = [
        //   ...this.userPosts.slice(0, index),
        //   data.updateUserPost,
        //   ...this.userPosts.slice(index + 1)
        // ];
        // console.log(data);
        this.setLoading(false);
        this.setSketchList(data.saveSketch);
        this.router.push("/");
        // this.router.go()

        // this.setSavedSketch(data.saveSketch);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  saveTemplate(payload) {
    this.setLoading(true);
    console.log("saveTemplate in store");
    apolloClient
      .mutate({
        mutation: SAVE_TEMPLATE,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // const index = this.userPosts.findIndex(
        //   post => post._id === data.updateUserPost._id
        // );
        // const resident = [
        //   ...this.userPosts.slice(0, index),
        //   data.updateUserPost,
        //   ...this.userPosts.slice(index + 1)
        // ];
        // console.log(data);
        this.setLoading(false);
        this.setTemplateList(data.saveTemplate);
        this.setTemplateIsSaved(true);
        // this.router.push("/");
        // this.router.go()

        // this.setSavedSketch(data.saveSketch);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  saveFlyer(payload) {
    this.setLoading(true);
    console.log("saveflyer in store");
    apolloClient
      .mutate({
        mutation: SAVE_FLYER,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        this.setLoading(false);
        this.setSavedFlyer(data.saveFlyer);
        const {
          flyerId,
          flyerTitle,
          type,
          setUp,
          distributed,
        } = data.saveFlyer;
        this.savedFlyerList.push({
          flyerId,
          flyerTitle,
          type,
          setUp,
          distributed,
        });
        if (this.sketchList.length > 0) {
          const index = _.findIndex(this.sketchList, (item) => {
            return item.flyerId == flyerId;
          });
          if (index > -1) {
            const newSketchList = this.sketchList.filter((item) => {
              return item.flyerId != flyerId;
            });
            this.setSketchList(newSketchList);
          }
        }
        // console.log(this.savedFlyerList)
        // this.router.push("/");
        // this.router.go()

        // this.setSavedSketch(data.saveSketch);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  saveShoppingCart(payload) {
    // console.log(payload)
    this.setSaveShoppingCartLoading(true)
    apolloClient
      .mutate({
        mutation: SAVE_SHOPPING_CART,
        variables: payload,
        update:(cache, { data: {saveShoppingCart}}) => {
          const { itemCode, quantity } = saveShoppingCart
          // console.log(saveShoppingCart)
          const cartData = this.shoppingCart
          if(cartData.length > 0){
              const index = _.findIndex(cartData, item => {
              return itemCode == item.itemCode
            })
            if(index >= 0) {
              cartData[index].quantity = quantity
            } else {
              cartData.push(saveShoppingCart)
            }
            this.setShoppingCart(cartData)
          } else {
            cartData.push(saveShoppingCart)
            this.setShoppingCart(cartData)
          }
        },
        refetchQueries: [{query: GET_SHOPPING_CART, variables: {resident: payload.resident}}]
      })
      .then(({ data }) => {
        const { saveShoppingCart } = data
        // this.setShoppingCart(saveShoppingCart)
        // console.log(saveShoppingCart)
    this.setSaveShoppingCartLoading(false)
    this.router.go()
        
      })
      .catch(err => {
        console.error(err)
    this.setSaveShoppingCartLoading(false)

      })
  },

  saveSubstituteItems(payload) {
    apolloClient
      .mutate({
        mutation: SAVE_SUBSTITUTE_ITEMS,
        variables: payload
      })
      .then(({data}) => {
        console.log(data)
      })
      .catch(err => console.error(err))
  },

  saveItemCatalog(payload) {
    // console.log(payload)
    this.setItemCatalogLoading(true);
    apolloClient
      .mutate({
        mutation: SAVE_ITEM_CATALOG,
        variables: payload,
      })
      .then(({
        data
      }) => {
        
        this.setAllItemCatalog(data.saveItemCatalog);
        this.setItemCatalogLoading(false);
      })
      .catch((err) => {
        console.log(err);
        this.setItemCatalogLoading(false);
      });
  },

  searchAvailableDeals(payload) {
    this.setSearchCouponLoading(true)
    apolloClient
      .query({
        query:SEARCH_AVAILABLE_DEALS,
        variables: payload
      })
      .then(({data})=> {
        const {searchAvailableDeals} = data
        // console.log('searchAvailableCoupons', searchAvailableDeals)
        // if(searchAvailableDeals.length==0) {
        //   this.setSoughtCoupons('No Available Deal')
        // } else {
          this.setSoughtDeals(searchAvailableDeals)
        // }
        
        this.setSearchCouponLoading(false)
      })
      .catch(err => {
        console.error(err)
        this.setSearchCouponLoading(false)
      })
  },

  sendMessage(payload) {
    apolloClient
      .mutate({
        mutation: SEND_MESSAGE,
        variables: payload
      })
      .then(({data}) => {
        const { sendMessage } = data
        console.log(sendMessage)
      })
      .catch(err => console.error(err))
  },

  setUpFlyer(payload) {
    this.setVendorHomeLoading(true);
    apolloClient
      .query({
        query: SET_UP_FLYER,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        const {
          type,
          couponPages
        } = data.setUpFlyer;
        this.setSavedFlyer(data.setUpFlyer);
        this[
          type == "FLYERCOUPON" ? "setPagePreview_C" : "setPagePreview"
        ](couponPages);
        this.setVendorHomeLoading(false);
        if (data.setUpFlyer.setUp) {
          this.router.push("/vendorflyers/5");
        } else {
          this.router.push("/vendorflyers/4");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },



  signupResident(payload) {
    this.clearError();
    this.setLoading(true);
    apolloClient
      .mutate({
        mutation: SIGNUP_RESIDENT,
        variables: payload,
      })
      .then(({
        data
      }) => {
        this.setLoading(false);
        // localStorage.setItem("token", data.signupResident.token);
        // this.router.go();
      })
      .catch((err) => {
        this.setLoading(false);
        this.setError(err);
        console.error(err);
      });
  },

  signupVendor(payload) {
    this.clearError();
    this.setLoading(true);
    // console.log(payload);
    apolloClient
      .mutate({
        mutation: SIGNUP_VENDOR,
        variables: payload,
      })
      .then(({
        data
      }) => {
        this.setLoading(false);
        // localStorage.setItem("token", data.signupResident.token);
        // this.router.go();
      })
      .catch((err) => {
        this.setLoading(false);
        this.setError(err);
        console.error(err);
      });
  },

  signinResident(payload) {
    this.clearError();
    this.setLoading(true);
    apolloClient
      .mutate({
        mutation: SIGNIN_RESIDENT,
        variables: payload,
      })
      .then(({
        data
      }) => {
        console.log(data);
        // localStorage.setItem("token", data.signinResident.token);
        if (data.signinResident.confirmed) {
          localStorage.setItem("token", data.signinResident.token);
          this.setLoading(false);
          // console.log(data.signinUser.confirmed);
          // this.setConfirmed(data.signinResident.confirmed);
          this.router.go();
        } else {
          this.setLoading(false);
          this.setError("Please finish email verification");
        }
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
        // this.setError(err);
      });
  },

  signinVendor(payload) {
    this.clearError();
    this.setLoading(true);
    apolloClient
      .mutate({
        mutation: SIGNIN_VENDOR,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // this.setLoading(true);
        // console.log(data);
        this.router.push("/");
        // localStorage.setItem("token", data.signinResident.token);
        if (data.signinVendor.confirmed) {
          localStorage.setItem("vendortoken", data.signinVendor.token);
          this.setLoading(false);
          this.router.go();
        } else {
          this.setError("Please finish email verification");
          this.setLoading(false);
        }
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
        // this.setError(err);
      });
  },

  async signoutResident() {
    this.clearResident();
    this.setLoading(false)

    localStorage.clear();
    await apolloClient.resetStore();
    this.router.push("/");
  },

  async signoutVendor() {
    this.clearVendor();
    this.setLoading(false)
    localStorage.clear();
    await apolloClient.resetStore();
    this.router.push("/");
    // this.router.go();
  },

  async startGuild(payload) {
    apolloClient
      .mutate({
        mutation: START_GUILD,
        variables: payload,
        update:(cache, {data:{startGuild}}) => {
          // console.log(startGuild)
          const data = cache.readQuery({query: GET_CURRENT_RESIDENT})
          const guildAddedGuild = _.findIndex(startGuild.guilds, guild => {
            return guild._id == startGuild.idAdded
          })

          data.getCurrentResident = {...data.getCurrentResident, ...{guildOwned: startGuild.idAdded}, ...{guild: startGuild.guilds[guildAddedGuild]}}
          // console.log(this.resident)
          cache.writeQuery({query: GET_CURRENT_RESIDENT, data})
          this.setResident(data.getCurrentResident)
        },
        refetchQueries: [{ query: GET_CURRENT_RESIDENT }, { query: GET_ALL_GUILDS }],
        awaitRefetchQueries: true
      })
      .then(({data}) => {
        console.log(data)
        const { startGuild }  = data
        // this.router.go()
        // const newResident = {...this.resident, ...{guildOwned: startGuild.idAdded}, ...{guild: startGuild.guilds}}

        // this.setGuilds(startGuild.guilds)
        // this.setResident(newResident)
      })
      .catch(err => console.error(err))
  },

 async stashFlyer(payload) {
    apolloClient
      .mutate({
        mutation: STASH_FLYER,
        variables: payload,
        update:(cache, {data: { stashFlyer }}) => {
          // Apollo Client 3 freezes query results; the old splice-to-empty then
          // push-each pattern wrote straight into the frozen array. The list is
          // replaced wholesale instead, which is what it amounted to anyway.
          const cached = cache.readQuery({ query: GET_CURRENT_RESIDENT });
          const stashedFlyers = stashFlyer.map((flyer) => {
            return ({
              vendor: flyer.vendor,
              flyerId: flyer.flyerId,
              flyerTitle: flyer.flyerTitle,
              flyerType: flyer.flyerType,
              dateFrom: flyer.dateFrom,
              dateTo: flyer.dateTo,
              promoInfo: flyer.promoInfo,
              logo: flyer.logo,
              targetDistribute: flyer.targetDistribute,
              __typename: "StashedFlyer",
            })
          })
          // Write updated data back to query
          cache.writeQuery({
            query: GET_CURRENT_RESIDENT,
            data: {
              getCurrentResident: {
                ...cached.getCurrentResident,
                stashedFlyers,
              },
            },
          });
        }
      })
      .then(({data}) => {
        console.log(data.stashFlyer)
      })
      .catch(err => console.error(err))
 },

  async toggleGuildDealActive(payload) {
    apolloClient
      .mutate({
        mutation: TOGGLE_GUILD_DEAL_ACTIVE,
        variables: payload
      })
      .then(({data}) => {
        const { toggleGuildDealActive } = data
        this.setGuildDeals(toggleGuildDealActive)
      })
  },

  updateAvatar(payload) {
    this.setLoading(true);
    apolloClient
      .mutate({
        mutation: UPDATE_AVATAR,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // const index = this.userPosts.findIndex(
        //   post => post._id === data.updateUserPost._id
        // );
        // const resident = [
        //   ...this.userPosts.slice(0, index),
        //   data.updateUserPost,
        //   ...this.userPosts.slice(index + 1)
        // ];
        // console.log(this.resident.avatarPic);
        // console.log(data);
        this.resident.avatarPic = data.updateAvatar.avatar;
        this.setLoading(false);
        this.setResident(this.resident);
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  updateMonsterChest(payload) {
    console.log(payload)
    this.setLoading(true)
    apolloClient
      .mutate({
        mutation: UPDATE_MONSTER_CHEST,
        variables: payload
      })
      .then(({data}) => {
        this.setLoading(false);

        console.log(data.updateMonsterChest)
      })
      .catch((err) => {
        this.setLoading(false);

        console.log(err)
      })
  },

  updateProfile(payload) {
    this.setLoading(true);
    apolloClient
      .mutate({
        mutation: UPDATE_PROFILE,
        variables: payload,
        // update:(cache,{data:{updateProfile}}) => {
        //   const data = cache.readQuery({query: GET_CURRENT_RESIDENT})
        //   data.getCurrentResident.profileFilled = true
        //   cache.writeQuery({query: GET_CURRENT_RESIDENT, data})
        //   const resident = this.resident
        //   resident.profileFilled = true
        //   this.setResident(resident)
        // }
      })
      .then(({
        data
      }) => {
        // console.log(data);
        this.setLoading(false);
        this.setResident(data.updateProfile);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
        setTimeout(() => {
          // this.tranStart = false;
          this.router.push("/");
          // this.router.go()
        }, 1000);
        
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  updateVendorProfile(payload) {
    console.log(payload);
    this.setVendorProfileLoading(true);
    apolloClient
      .mutate({
        mutation: UPDATE_VENDOR_PROFILE,
        variables: payload,
        // fetchPolicy: "no-cache",
        // refetchQueries: [
        //   {
        //     query: GET_CURRENT_VENDOR
        //   },
        // ],
        // awaitRefetchQueries: true,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        console.log(data.updateVendorProfile);

        this.setVendor(data.updateVendorProfile);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
        this.setVendorProfileLoading(false);
        this.router.replace("/");
        
      })
      .catch((err) => {
        this.setVendorProfileLoading(false);
        console.error(err);
      });
  },

  updateSavedFlyer(payload) {
    this.setLoading(true);
    console.log("updatesavedflyer in store");
    apolloClient
      .mutate({
        mutation: UPDATE_SAVED_FLYER,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // const index = this.userPosts.findIndex(
        //   post => post._id === data.updateUserPost._id
        // );
        // const resident = [
        //   ...this.userPosts.slice(0, index),
        //   data.updateUserPost,
        //   ...this.userPosts.slice(index + 1)
        // ];
        // console.log(data);
        this.setLoading(false);
        this.setSavedFlyer(data.updateSavedFlyer);
        if (this.savedFlyerList.length > 0) {
          const indexOfList = _.findIndex(this.savedFlyerList, (item) => {
            return data.updateSavedFlyer.flyerId == item.flyerId;
          });
          this.savedFlyerList[indexOfList].setUp = data.updateSavedFlyer.setUp;
        }

        // this.router.push("/");
        // this.router.go()

        // this.setSavedSketch(data.saveSketch);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
      })
      .catch((err) => {
        this.setLoading(false);
        console.error(err);
      });
  },

  updateShoppingCart(payload) {
    apolloClient
      .mutate({
        mutation: UPDATE_SHOPPING_CART,
        variables: payload,
        update: (cache, {data:{updateShoppingCart}}) => {
          // console.log(updateShoppingCart)
          const {itemCode, quantity} = updateShoppingCart

          if (itemCode == null) {
            this.setShoppingCart(null)
            return
          }

          const items = this.shoppingCart
          const index = _.findIndex(items, item => {
            return item.itemCode == itemCode
          })
          if (quantity > 0) {
            items[index].quantity = quantity
          } else {
            items.splice(index, 1)
            // console.log(items)
          }
          console.log(items)
          this.setShoppingCart(items)
        },
        // optimisticResponse: {
        //   updateShoppingCart: {
        //     __typename: "UpdateOfShpCat",
        //     itemCode: payload.itemCode,
        //     quantity: payload.quantity
        //   },
        // },
        // refetchQueries: [{ query: GET_SHOPPING_CART, variables: { resident: payload.resident}}]
      })
      .then(({data}) => {
        console.log(data)
      })
      .catch(err => console.error(err))
    }
};

export default actions;