import {
  defaultClient as apolloClient
} from "../main.js";
import router from "../router/router";
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

  checkSavedFingerPrint: ({
    commit
  }, payload) => {
    apolloClient
      .query({
        query: CHECK_SAVED_FINGERPRINT,
        variables: payload,
      })
      .then(({
        data
      }) => {
        commit("setFingerPrintIsSaved", data.checkSavedFingerPrint.fingerPrintIsSaved);
        // if ((localStorage.getItem('token') || localStorage.getItem('vendortoken')) && !data.checkSavedFingerPrint.fingerPrintIsSaved) {
        //   commit("clearResident");
        //   commit("clearVendor");
        //   localStorage.clear();
        //   apolloClient.resetStore();
        //   router.push("/");
        // }
      });
  },

commitGuildDeals: ({commit}, payload) => {
  commit("setCommitGuildDealLoading", true)
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
         commit("setGuildDealsStatus", commitGuildDeals)
      }
    })
    .then(({data}) => {
      const { commitGuildDeals } = data
      commit("setGuildDealsStatus", commitGuildDeals)
      commit("setCommitGuildDealLoading", false)

    })
    .catch(err => {
      console.error(err)
      commit("setCommitGuildDealLoading", false)
    })

 },

 createPromotionEvent: ({state, commit}, payload) => {
  console.log(payload)
    apolloClient
      .mutate({
        mutation: CREATE_PROMOTION_EVENT,
        variables: payload,
        update:(cache,{})=>{
          console.log(payload)
          const list = [...state.news]
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
          commit("setNews",list)
        }
      })
      .then(({data}) => {
        const { createPromotionEvent } = data
        // console.log(createPromotionEvent)
        commit("setPromotionEvents", createPromotionEvent)
      })
      .catch(err => console.error(err))
 },

  distributeFlyer: ({
    state,
    commit
  }, payload) => {
    commit("setLoading", true);
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
        const indexOfList = _.findIndex(state.savedFlyerList, (item) => {
          return item.flyerId == flyerId;
        });
        state.savedFlyerList[indexOfList].distributed = true;
        // console.log(data);
        commit("setLoading", false);
        router.push("/");
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  targetDistribute: ({
    state,
    commit
  }, payload) => {
    commit("setLoading", true);
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
        const indexOfList = _.findIndex(state.savedFlyerList, (item) => {
          return item.flyerId == flyerId;
        });
        state.savedFlyerList[indexOfList].distributed = true;
        // console.log(data);
        commit("setLoading", false);
        router.push("/");
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  feedPet: ({commit}, payload) => {
    // console.log(payload)
    apolloClient
      .mutate({
        mutation: FEED_PET,
        variables: payload,
        update:(cache, {data: { feedPet }}) => {
          console.log(feedPet)
          const data = cache.readQuery({ query: GET_CURRENT_RESIDENT })
          if (data.getCurrentResident.flyersFedToPet) {
            data.getCurrentResident.flyersFedToPet.push(payload.flyerId)
          } else {
            let list = []
            list.push(payload.flyerId)
            data.getCurrentResident = {...data.getCurrentResident, ...{flyersFedToPet: list}}
          }
          if(data.getCurrentResident.stashedFlyers 
            && data.getCurrentResident.stashedFlyers.length > 0 
            && payload.stashOrActive == 'Stash') {
            const index = _.findIndex(data.getCurrentResident.stashedFlyers, flyer => {
                return payload.flyerId == flyer.flyerId
            })
            if (index >= 0) {
              data.getCurrentResident.stashedFlyers.splice(index, 1)
            }
          }
          if(data.getCurrentResident.guild) {
            const guildCut = payload.silverRewarded * data.getCurrentResident.guild.contributionRatio
            data.getCurrentResident.guild.guildSilver += guildCut
            data.getCurrentResident.silverCoins += (payload.silverRewarded - guildCut)
          } else {
            data.getCurrentResident.silverCoins  += payload.silverRewarded
          }
          
          data.getCurrentResident.petExperience += payload.petExperienceGained
          
          // console.log(data.getCurrentResident)
          // commit('setResident', data.getCurrentResident)
          cache.writeQuery({
            query: GET_CURRENT_RESIDENT,
            data
          });
          commit('setResident', feedPet)
        }
      })
      .then(({data}) => {
        const { feedPet } = data
        // console.log(feedPet)
        // commit("setResident", feedPet)
      })
      .catch(err => console.error(err))
  },

  getActiveFlyer: ({
    commit
  }) => {
    // console.log("getactiveflyer")
    apolloClient
      .query({
        query: GET_ACTIVE_FLYER,
      })
      .then(({
        data
      }) => {
        // console.log(data.getActiveFlyer);
        commit("setActiveFlyerList", data.getActiveFlyer);
        // localStorage.setItem('resident', JSON.stringify(data.getCurrentResident));
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getAllItemsCatalog: ({
    commit
  }, payload) => {
    commit("setLoading", true);
    apolloClient
      .query({
        query: GET_ALL_ITEM_CATALOG,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // console.log(data)
        commit("setAllItemCatalog", data.getAllItemsCatalog);
        commit("setLoading", false);
      })
      .catch((err) => {
        console.log(err);
        commit("setLoading", false);
      });
  },

  getAllGuilds: ({commit}) => {
    apolloClient
      .query({query: GET_ALL_GUILDS})
      .then(({data}) => {
        const { getAllGuilds } = data
        commit("setGuilds", getAllGuilds)
      })
      .catch(err => console.error(err))
  },

  getAllGuildDeals: ({commit}) => {
    apolloClient
      .query({query: GET_ALL_GUILD_DEALS})
      .then(({data}) => {
        const {getAllGuildDeals} = data
        commit("setAllGuildDeals", getAllGuildDeals)
      })
      .catch(err => console.error(err))
  },

  getCityHall: ({commit}) => {
    apolloClient
      .query({query: GET_CITYHALL})
      .then(({data})=>{
        const {getCityHall} = data
        console.log(getCityHall)
        commit('setCityHall', getCityHall)
      })
      .catch(err => console.error(err))
  },

  getCurrentResident: ({
    commit
  }) => {
    // console.log("this is done")
    commit("setLoading", true);
    apolloClient
      .query({
        query: GET_CURRENT_RESIDENT,
      })
      .then(({
        data
      }) => {
        console.log(data);
        commit("setLoading", false);
        commit("setResident", data.getCurrentResident);
        // localStorage.setItem('resident', JSON.stringify(data.getCurrentResident));
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  getCurrentVendor: ({
    commit
  }) => {
    // console.log("this is done")
    commit("setLoading", true);
    apolloClient
      .query({
        query: GET_CURRENT_VENDOR,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        commit("setLoading", false);
        commit("setVendor", data.getCurrentVendor);
        // localStorage.setItem('resident', JSON.stringify(data.getCurrentResident));
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  getCustomerRatings: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_CUSTOMER_RATINGS,
        variables: payload
      })
      .then(({data}) => {
        const { getCustomerRatings } = data
        // console.log(getCustomerRatings)
        commit("setCustomerRatings", getCustomerRatings)
      })
      .catch( err => console.error(err))
  },

  getGamePropList: ({
    commit
  }) => {
    apolloClient
      .query({
        query: GET_GAME_PROP_LIST,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        commit("setGamePropList", data.getGamePropList);
      })
      .catch((err) => {
        console.error(err);
      });
  },


  getGameSubstituteList: ({
    commit
  }) => {
    apolloClient
      .query({
        query: GET_GAME_SUBSTITUTE_LIST,
      })
      .then(({
        data
      }) => {
        console.log(data);
        commit("setGameSubstituteList", data.getGameSubstituteList);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getGuildLogos: ({commit}) => {
    apolloClient
      .query({query: GET_GUILD_LOGOS})
      .then(({data}) => {
        const { getGuildLogos } = data
        commit("setGuildLogos", getGuildLogos)
      })
      .catch(err => console.error(err))
  },

  getGuildChatMessages: ({ commit }, payload) => {
    apolloClient
      .query({
        query: GET_GUILD_CHAT_MESSAGES,
        variables: payload
      })
      .then(({data}) => {
        // console.log(data)
        const { getGuildChatMessages } = data
        // console.log(getGuildChatMessages)
        commit('setGuildChatMessages', getGuildChatMessages)
      })
      .catch(err => console.error(err))
  },

  getGuildDealsStatus: ({commit}, payload) => {
    console.log(payload)
    apolloClient
      .query({
        query: GET_GUILD_DEALS_STATUS,
        variables: payload
      })
      .then(({data}) => {
        const { getGuildDealsStatus } = data
        console.log(getGuildDealsStatus)
        commit("setGuildDealsStatus", getGuildDealsStatus)
      })
      .catch(err => console.error(err))
  },

  getItemCatalog: ({
    commit, state
  }, payload) => {
    // console.log('getItemCatalog')
    commit("setItemCatalogLoading", true);
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
          // console.log(state.vendorPromotionEvents)
          // state.vendorPromotionEvents.map(event => {
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
          commit("setItemCatalogSaved", {
            subcategory: data.getItemCatalog[0].subcategory,
            itemDetailed: [...data.getItemCatalog]
          });
          commit("setItemCatalogLoading", false);
        } else {
          commit("setItemCatalogLoading", false);
        }
      })
      .catch((err) => {
        console.error(err);
        commit("setItemCatalogLoading", false);
      });
  },

  getMetroSpec: ({commit}) => {
    apolloClient
      .query({ query: GET_METRO_SPEC})
      .then(({data}) => {
        
        const { getMetroSpec } =  data 
        console.log(getMetroSpec )
        commit('setMetroSpec', getMetroSpec)
      })
      .catch(err => console.error(err))
  },

  getNews: ({commit}) => {
    apolloClient
      .query({ query: GET_NEWS})
      .then(({data}) => {
        const { getNews } = data
        commit('setNews', getNews)
      })
      .catch(err => console.error(err))
  },

  getPets: ({
    commit
  }) => {
    apolloClient
      .query({
        query: GET_PETS,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        commit("setPets", data.getPets);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getPromotionEvents: ({commit}) => {
    apolloClient
      .query({
        query: GET_PROMOTION_EVENTS,
      })
      .then(({data}) => {
        const { getPromotionEvents } = data
        commit("setPromotionEvents", getPromotionEvents)
      })
      .catch(err => console.error(err))
  },

  getEventCategory: ({
    commit
  }) => {
    apolloClient
    .query({
      query: GET_EVENT_CATEGORY,
    })
    .then(({data}) => {
      // console.log(data.getPromotionEvents);
      commit("setEventCategory", data.getEventCategory);
    })
    .catch((err) => {
      console.log(err)
    })
  },

  getResidentOrders: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_RESIDENT_ORDERS,
        variables: payload
      })
      .then(({data}) => {
        const { getResidentOrders } = data
        commit("setResidentOrders", getResidentOrders)
        console.log('getResidentOrder', getResidentOrders)
      })
      .catch(err => console.error(err))
  },

  getRewardItems: ({commit}) => {
    apolloClient
    .query({
      query: GET_REWARD_ITEMS
    })
    .then(({date}) => {
      commit("setRewardItems", data.getRewardItems)
    })
    .catch((err) => {
      console.log(err)
    })
  },

  getSelectedSketch: ({
    commit
  }, payload) => {
    commit("setVendorHomeLoading", true);
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
        commit(
          type == "FLYERCOUPON" ? "setSelectedSketch_C" : "setSelectedSketch",
          data.getSelectedSketch
        );
        commit("setVendorHomeLoading", false);
        router.push("/vendorflyers/2");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getSelectedTemplate: ({
    commit
  }, payload) => {
    commit("setVendorHomeLoading", true);
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
        commit(
          type == "FLYERCOUPON" ?
          "setSelectedTemplate_C" :
          "setSelectedTemplate",
          data.getSelectedTemplate
        );
        commit("setVendorHomeLoading", false);
        router.push("/vendorflyers/2");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getSelectedFlyerClientView: ({
    commit
  }, payload) => {
    commit("setClientPreviewLoading", true);
    apolloClient
      .query({
        query: GET_SELECTED_FLYER_CLIENT_VIEW,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // console.log(data.getSelectedFlyerClientView);
        commit("setClientPageView", data.getSelectedFlyerClientView);
        commit("setClientPreviewLoading", false);
      })
      .catch((err) => {
        commit("setClientPreviewLoading", false);
        console.log(err);
      });
  },

  getShoppingCart: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_SHOPPING_CART,
        variables: payload
      })
      .then(({data}) => {
        const { getShoppingCart } = data
        commit("setShoppingCart", getShoppingCart)
      })
      .catch(err => console.error(err))
  },

  getSingleItemRating: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_SINGLE_ITEM_RATING,
        variables: payload
      })
      .then(({ data }) => {
        const {getSingleItemRating} = data
        commit('setSingleItemRating', getSingleItemRating)
      })
      .catch(err => console.error(err))
  },

  getSketchList: ({
    commit
  }, payload) => {
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
          commit("setSketchList", data.getSketchList);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getFlyerList: ({
    commit
  }, payload) => {
    commit("setLoading", true)
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
          commit("setFlyerList", data.getFlyerList);
          commit("setLoading", false)
        }
      })
      .catch((err) => {
        console.error(err);
        commit("setLoading", false)
      });
  },

  getTemplateList: ({
    commit
  }, payload) => {
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
          commit("setTemplateList", data.getTemplateList);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getProductCategory: ({
    commit
  }) => {
    // console.log("signup vendor")
    apolloClient
      .query({
        query: GET_PRODUCTS_CATEGORIES,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        commit("setProductsCategories", data.getProductCategory);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getServiceCategory: ({
    commit
  }) => {
    apolloClient
      .query({
        query: GET_SERVICES_CATEGORIES,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        commit("setServicesCategories", data.getServiceCategory);
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getRestaurantCategory: ({
    commit
  }) => {
    apolloClient
      .query({
        query: GET_RESTAURANT_CATEGORIES,
      })
      .then(({
        data
      }) => {
        // console.log(data);
        commit(
          "setRestaurantCategories",
          data.getRestaurantCategory.items.sort()
        );
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getVendorFlyers: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_VENDOR_FLYERS,
        variables: payload
      })
      .then(({data})=> {
        const { getVendorFlyers } = data
        commit('setVendorFlyers', getVendorFlyers)
      })
      .catch(err=>console.error(err))
  },

  getVendorGuildDeals: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_VENDOR_GUILD_DEALS,
        variables: payload
      })
      .then(({data}) => {
        const {getVendorGuildDeals} = data
        commit("setGuildDeals", getVendorGuildDeals)
      })
      .catch(err => console.log(err))
  },

  getVendorList: ({commit}) => {
    apolloClient
      .query( {query: GET_VENDOR_LIST})
      .then(({data})=>{
        const {getVendorList} = data
        commit("setVendorList", getVendorList)
      })
      .catch(err => console.error(err))
  },

  getVendorOrders: ({commit}, payload) => {
    commit('setVendorHomeLoading', true)
    apolloClient
      .query({
        query: GET_VENDOR_ORDERS,
        variables: payload
      })
      .then(({data}) => {
        const { getVendorOrders } = data
        commit("setVendorOrders", getVendorOrders)
        commit('setVendorHomeLoading', false)
      })
      .catch(err => 
       {
         console.error(err)
        commit('setVendorHomeLoading', false)
       } 
       )
  },

  getVendorSalesInfo: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_VENDOR_SALES_INFO,
        variables: payload
      })
      .then(({data})=> {
        const { getVendorSalesInfo } = data
        commit('setVendorSalesInfo', getVendorSalesInfo)
      })
      .catch(err => console.error(err))
  },

  getVendorSettlementRecords: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_VENDOR_SETTLEMENT_RECORDS,
        variables: payload
      })
      .then(({data}) => {
        const { getVendorSettlementRecords } = data
        commit("setVendorSettlementRecords", getVendorSettlementRecords)
      })
      .catch(err => console.error(err))
  },

  getVendorPromotionEvents: ({commit}, payload) => {
    apolloClient
      .query({
        query: GET_VENDOR_PROMOTION_EVENTS,
        variables: payload
      })
      .then(({data}) => {
        const { getVendorPromotionEvents } = data
        commit("setVendorPromotionEvents", getVendorPromotionEvents)
      })
      .catch(err => console.error(err))
  },

  getVendorInterface: ({commit}, payload) => {
    commit("setLoading", true)
    apolloClient
      .query({
        query: GET_VENDOR_INTERFACE,
        variables: payload
      })
      .then(({data}) => {
        const {getVendorInterface} = data
        // console.log(getVendorInterface)
        commit("setVendorInterface", getVendorInterface)
        commit("setCustomerRatings", getVendorInterface.customerRatings)
        commit("setLoading", false)
      })
      .catch(err => {
        console.error(err)
        commit("setLoading", false)
      })
  },

   joinGuild: ({commit, state}, payload) => {
    apolloClient
      .mutate({
        mutation: JOIN_GUILD,
        variables: payload,
        update:(cache,{ data : { joinGuild }}) => {
          // const residentData = cache.readQuery({ query: GET_CURRENT_RESIDENT})
          // console.log(joinGuild)
          let newResident
          if(state.resident.guild == null) {
            newResident = state.resident
            newResident.guild = joinGuild
          } else {
              newResident = { ...state.resident, guild: joinGuild }
          // console.log(newResident)
          }
         
          commit("setResident", newResident)
        },
        // refetchQueries: [{ query: GET_CURRENT_RESIDENT }, { query: GET_ALL_GUILDS }],
        // awaitRefetchQueries: true
      })
      .then(({data}) => {
        const {joinGuild} = data
        // console.log(state.resident)
        // console.log(state.guilds)
        // router.go()
        //  const newResident = { ...state.resident, ...{ guild: joinGuild}}
        //   console.log(newResident)
        //   commit("setResident", newResident)
      })
      .catch(err => console.error(err))
  },

  placeOrder: ({commit}, payload) => {
    commit("setPlaceOrderLoading", true)
    apolloClient
      .mutate({
        mutation: PLACE_ORDER,
        variables: payload
      })
      .then(({data}) => {
        const { placeOrder} = data
        console.log(placeOrder)
        commit("setResidentOrders", placeOrder)
       commit("setPlaceOrderLoading", false)
      //  router.push({name: "vendorInterface", params: { vendor: placeOrder[0].rendor }} )
      // router.go(-3)
      router.go()

      })
      .catch(err => {
        console.error(err)
        commit("setPlaceOrderLoading", false)
         }
        )
  },

  quitGuild: ({commit, state}, payload) => {
    apolloClient
      .mutate({
        mutation: QUIT_GUILD,
        variables: payload,
        update:(cache,{ data : { quitGuild }}) => {
          const newResident = state.resident
          newResident.guild = null
          commit("setResident", newResident)
        },
        // refetchQueries: [{ query: GET_CURRENT_RESIDENT }, { query: GET_ALL_GUILDS }],
        // awaitRefetchQueries: true
      })
      .then(({data})=> {
        console.log(data)
      })
      .catch(err => console.error(err))
  },

  saveCustomerRating: ({commit}, payload) => {
    // console.log(payload)
    apolloClient
      .mutate({
        mutation: SAVE_CUSTOMER_RATING,
        variables: payload
      })
      .then(({data}) => {
        const { saveCustomerRating } = data
        // console.log(saveCustomerRating)
        commit("setCustomerRatings", saveCustomerRating)
      })
      .catch(err => console.error(err))
  },

  saveGuildDeals: ({commit}, payload) => {
    apolloClient
    .mutate({
      mutation: SAVE_GUILD_DEALS,
      variables: payload
    })
    .then(({data}) => {
      commit("setGuildDeals", data.saveGuildDeals)
      router.go()
    })
    .catch(err => console.log(err))
  },

  saveSingleItemRating: ({commit}, payload) => {
    apolloClient
      .mutate({
        mutation: SAVE_SINGLE_ITEM_RATING,
        variables: payload
      })
      .then(({data}) => {
        const { saveSingleItemRating } = data
        commit('setSingleItemRating', saveSingleItemRating)
      })
      .catch(err => console.error(err))
  },

  saveSketch: ({
    state,
    commit
  }, payload) => {
    commit("setLoading", true);
    console.log("savesketch in store");
    apolloClient
      .mutate({
        mutation: SAVE_SKETCH,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // const index = state.userPosts.findIndex(
        //   post => post._id === data.updateUserPost._id
        // );
        // const resident = [
        //   ...state.userPosts.slice(0, index),
        //   data.updateUserPost,
        //   ...state.userPosts.slice(index + 1)
        // ];
        // console.log(data);
        commit("setLoading", false);
        commit("setSketchList", data.saveSketch);
        router.push("/");
        // router.go()

        // commit("setSavedSketch", data.saveSketch);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  saveTemplate: ({
    state,
    commit
  }, payload) => {
    commit("setLoading", true);
    console.log("saveTemplate in store");
    apolloClient
      .mutate({
        mutation: SAVE_TEMPLATE,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // const index = state.userPosts.findIndex(
        //   post => post._id === data.updateUserPost._id
        // );
        // const resident = [
        //   ...state.userPosts.slice(0, index),
        //   data.updateUserPost,
        //   ...state.userPosts.slice(index + 1)
        // ];
        // console.log(data);
        commit("setLoading", false);
        commit("setTemplateList", data.saveTemplate);
        commit("setTemplateIsSaved", true);
        // router.push("/");
        // router.go()

        // commit("setSavedSketch", data.saveSketch);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  saveFlyer: ({
    state,
    commit
  }, payload) => {
    commit("setLoading", true);
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
        commit("setLoading", false);
        commit("setSavedFlyer", data.saveFlyer);
        const {
          flyerId,
          flyerTitle,
          type,
          setUp,
          distributed,
        } = data.saveFlyer;
        state.savedFlyerList.push({
          flyerId,
          flyerTitle,
          type,
          setUp,
          distributed,
        });
        if (state.sketchList.length > 0) {
          const index = _.findIndex(state.sketchList, (item) => {
            return item.flyerId == flyerId;
          });
          if (index > -1) {
            const newSketchList = state.sketchList.filter((item) => {
              return item.flyerId != flyerId;
            });
            commit("setSketchList", newSketchList);
          }
        }
        // console.log(state.savedFlyerList)
        // router.push("/");
        // router.go()

        // commit("setSavedSketch", data.saveSketch);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  saveShoppingCart: ({commit, state}, payload) => {
    // console.log(payload)
    commit("setSaveShoppingCartLoading", true)
    apolloClient
      .mutate({
        mutation: SAVE_SHOPPING_CART,
        variables: payload,
        update:(cache, { data: {saveShoppingCart}}) => {
          const { itemCode, quantity } = saveShoppingCart
          // console.log(saveShoppingCart)
          const cartData = state.shoppingCart
          if(cartData.length > 0){
              const index = _.findIndex(cartData, item => {
              return itemCode == item.itemCode
            })
            if(index >= 0) {
              cartData[index].quantity = quantity
            } else {
              cartData.push(saveShoppingCart)
            }
            commit("setShoppingCart", cartData)
          } else {
            cartData.push(saveShoppingCart)
            commit("setShoppingCart", cartData)
          }
        },
        refetchQueries: [{query: GET_SHOPPING_CART, variables: {resident: payload.resident}}]
      })
      .then(({ data }) => {
        const { saveShoppingCart } = data
        // commit("setShoppingCart", saveShoppingCart)
        // console.log(saveShoppingCart)
    commit("setSaveShoppingCartLoading", false)
    router.go()
        
      })
      .catch(err => {
        console.error(err)
    commit("setSaveShoppingCartLoading", false)

      })
  },

  saveSubstituteItems: ({commit}, payload) => {
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

  saveItemCatalog: ({
    commit
  }, payload) => {
    // console.log(payload)
    commit("setItemCatalogLoading", true);
    apolloClient
      .mutate({
        mutation: SAVE_ITEM_CATALOG,
        variables: payload,
      })
      .then(({
        data
      }) => {
        
        commit("setAllItemCatalog", data.saveItemCatalog);
        commit("setItemCatalogLoading", false);
      })
      .catch((err) => {
        console.log(err);
        commit("setItemCatalogLoading", false);
      });
  },

  searchAvailableDeals: ({commit}, payload) => {
    commit('setSearchCouponLoading', true)
    apolloClient
      .query({
        query:SEARCH_AVAILABLE_DEALS,
        variables: payload
      })
      .then(({data})=> {
        const {searchAvailableDeals} = data
        // console.log('searchAvailableCoupons', searchAvailableDeals)
        // if(searchAvailableDeals.length==0) {
        //   commit('setSoughtCoupons', 'No Available Deal')
        // } else {
          commit('setSoughtDeals', searchAvailableDeals)
        // }
        
        commit('setSearchCouponLoading', false)
      })
      .catch(err => {
        console.error(err)
        commit('setSearchCouponLoading', false)
      })
  },

  sendMessage: ({commit}, payload) => {
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

  setUpFlyer: ({
    commit
  }, payload) => {
    commit("setVendorHomeLoading", true);
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
        commit("setSavedFlyer", data.setUpFlyer);
        commit(
          type == "FLYERCOUPON" ? "setPagePreview_C" : "setPagePreview",
          couponPages
        );
        commit("setVendorHomeLoading", false);
        if (data.setUpFlyer.setUp) {
          router.push("/vendorflyers/5");
        } else {
          router.push("/vendorflyers/4");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },



  signupResident: ({
    commit
  }, payload) => {
    commit("clearError");
    commit("setLoading", true);
    apolloClient
      .mutate({
        mutation: SIGNUP_RESIDENT,
        variables: payload,
      })
      .then(({
        data
      }) => {
        commit("setLoading", false);
        // localStorage.setItem("token", data.signupResident.token);
        // router.go();
      })
      .catch((err) => {
        commit("setLoading", false);
        commit("setError", err);
        console.error(err);
      });
  },

  signupVendor: ({
    commit
  }, payload) => {
    commit("clearError");
    commit("setLoading", true);
    // console.log(payload);
    apolloClient
      .mutate({
        mutation: SIGNUP_VENDOR,
        variables: payload,
      })
      .then(({
        data
      }) => {
        commit("setLoading", false);
        // localStorage.setItem("token", data.signupResident.token);
        // router.go();
      })
      .catch((err) => {
        commit("setLoading", false);
        commit("setError", err);
        console.error(err);
      });
  },

  signinResident: ({
    commit
  }, payload) => {
    commit("clearError");
    commit("setLoading", true);
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
          commit("setLoading", false);
          // console.log(data.signinUser.confirmed);
          // commit("setConfirmed", data.signinResident.confirmed);
          router.go();
        } else {
          commit("setLoading", false);
          commit("setError", "Please finish email verification");
        }
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
        // commit("setError", err);
      });
  },

  signinVendor: ({
    commit
  }, payload) => {
    commit("clearError");
    commit("setLoading", true);
    apolloClient
      .mutate({
        mutation: SIGNIN_VENDOR,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // commit("setLoading", true);
        // console.log(data);
        router.push("/");
        // localStorage.setItem("token", data.signinResident.token);
        if (data.signinVendor.confirmed) {
          localStorage.setItem("vendortoken", data.signinVendor.token);
          commit("setLoading", false);
          router.go();
        } else {
          commit("setError", "Please finish email verification");
          commit("setLoading", false);
        }
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
        // commit("setError", err);
      });
  },

  signoutResident: async ({
    commit
  }) => {
    commit("clearResident");
    commit("setLoading", false)

    localStorage.clear();
    await apolloClient.resetStore();
    router.push("/");
  },

  signoutVendor: async ({
    commit
  }) => {
    commit("clearVendor");
    commit("setLoading", false)
    localStorage.clear();
    await apolloClient.resetStore();
    router.push("/");
    // router.go();
  },

  startGuild: async ({commit, state}, payload) => {
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
          // console.log(state.resident)
          cache.writeQuery({query: GET_CURRENT_RESIDENT, data})
          commit('setResident', data.getCurrentResident)
        },
        refetchQueries: [{ query: GET_CURRENT_RESIDENT }, { query: GET_ALL_GUILDS }],
        awaitRefetchQueries: true
      })
      .then(({data}) => {
        console.log(data)
        const { startGuild }  = data
        // router.go()
        // const newResident = {...state.resident, ...{guildOwned: startGuild.idAdded}, ...{guild: startGuild.guilds}}

        // commit("setGuilds", startGuild.guilds)
        // commit("setResident", newResident)
      })
      .catch(err => console.error(err))
  },

 stashFlyer: async ({commit}, payload) => {
    apolloClient
      .mutate({
        mutation: STASH_FLYER,
        variables: payload,
        update:(cache, {data: { stashFlyer }}) => {
          const data = cache.readQuery({ query: GET_CURRENT_RESIDENT });
          // Create updated data
          data.getCurrentResident.stashedFlyers.splice(0, data.getCurrentResident.stashedFlyers.length)
          stashFlyer.map((flyer) => {
            data.getCurrentResident.stashedFlyers.push({
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
          // console.log(data);
          // commit('setResident', data.getCurrentResident)
          cache.writeQuery({
            query: GET_CURRENT_RESIDENT,
            data,
          });
        }
      })
      .then(({data}) => {
        console.log(data.stashFlyer)
      })
      .catch(err => console.error(err))
 },

  toggleGuildDealActive: async({commit}, payload) => {
    apolloClient
      .mutate({
        mutation: TOGGLE_GUILD_DEAL_ACTIVE,
        variables: payload
      })
      .then(({data}) => {
        const { toggleGuildDealActive } = data
        commit("setGuildDeals", toggleGuildDealActive)
      })
  },

  updateAvatar: ({
    state,
    commit
  }, payload) => {
    commit("setLoading", true);
    apolloClient
      .mutate({
        mutation: UPDATE_AVATAR,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // const index = state.userPosts.findIndex(
        //   post => post._id === data.updateUserPost._id
        // );
        // const resident = [
        //   ...state.userPosts.slice(0, index),
        //   data.updateUserPost,
        //   ...state.userPosts.slice(index + 1)
        // ];
        // console.log(state.resident.avatarPic);
        // console.log(data);
        state.resident.avatarPic = data.updateAvatar.avatar;
        commit("setLoading", false);
        commit("setResident", state.resident);
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  updateMonsterChest: ({commit}, payload) => {
    console.log(payload)
    commit("setLoading", true)
    apolloClient
      .mutate({
        mutation: UPDATE_MONSTER_CHEST,
        variables: payload
      })
      .then(({data}) => {
        commit("setLoading", false);

        console.log(data.updateMonsterChest)
      })
      .catch((err) => {
        commit("setLoading", false);

        console.log(err)
      })
  },

  updateProfile: ({
    state,
    commit
  }, payload) => {
    commit("setLoading", true);
    apolloClient
      .mutate({
        mutation: UPDATE_PROFILE,
        variables: payload,
        // update:(cache,{data:{updateProfile}}) => {
        //   const data = cache.readQuery({query: GET_CURRENT_RESIDENT})
        //   data.getCurrentResident.profileFilled = true
        //   cache.writeQuery({query: GET_CURRENT_RESIDENT, data})
        //   const resident = state.resident
        //   resident.profileFilled = true
        //   commit('setResident', resident)
        // }
      })
      .then(({
        data
      }) => {
        // console.log(data);
        commit("setLoading", false);
        commit("setResident", data.updateProfile);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
        setTimeout(() => {
          // this.tranStart = false;
          router.push("/");
          // router.go()
        }, 1000);
        
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  updateVendorProfile: ({
    commit
  }, payload) => {
    console.log(payload);
    commit("setVendorProfileLoading", true);
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

        commit("setVendor", data.updateVendorProfile);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
        commit("setVendorProfileLoading", false);
        router.replace("/");
        
      })
      .catch((err) => {
        commit("setVendorProfileLoading", false);
        console.error(err);
      });
  },

  updateSavedFlyer: ({
    state,
    commit
  }, payload) => {
    commit("setLoading", true);
    console.log("updatesavedflyer in store");
    apolloClient
      .mutate({
        mutation: UPDATE_SAVED_FLYER,
        variables: payload,
      })
      .then(({
        data
      }) => {
        // const index = state.userPosts.findIndex(
        //   post => post._id === data.updateUserPost._id
        // );
        // const resident = [
        //   ...state.userPosts.slice(0, index),
        //   data.updateUserPost,
        //   ...state.userPosts.slice(index + 1)
        // ];
        // console.log(data);
        commit("setLoading", false);
        commit("setSavedFlyer", data.updateSavedFlyer);
        if (state.savedFlyerList.length > 0) {
          const indexOfList = _.findIndex(state.savedFlyerList, (item) => {
            return data.updateSavedFlyer.flyerId == item.flyerId;
          });
          state.savedFlyerList[indexOfList].setUp = data.updateSavedFlyer.setUp;
        }

        // router.push("/");
        // router.go()

        // commit("setSavedSketch", data.saveSketch);
        // localStorage.setItem('resident', JSON.stringify(data.updateProfile));
      })
      .catch((err) => {
        commit("setLoading", false);
        console.error(err);
      });
  },

  updateShoppingCart: ({commit, state}, payload) => {
    apolloClient
      .mutate({
        mutation: UPDATE_SHOPPING_CART,
        variables: payload,
        update: (cache, {data:{updateShoppingCart}}) => {
          // console.log(updateShoppingCart)
          const {itemCode, quantity} = updateShoppingCart

          if (itemCode == null) {
            commit("setShoppingCart", null)
            return
          }

          const items = state.shoppingCart
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
          commit("setShoppingCart", items)
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