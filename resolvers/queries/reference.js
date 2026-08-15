/**
 * Query resolvers — reference.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */
const {
  EventCat,
  RewardItem,
  fs,
} = require("./_shared");

module.exports = {
  getPets: async (_, args, { Pet }) => {
    const pets = await Pet.find({});
    // console.log(pets);
    return pets;
  },

  getEventCategory: async (_, args, { EventCat }) => {
    const promotionEvents = await EventCat.find({});
    // console.log(promotionEvents);
    const eventList = promotionEvents.map((item) => {
      return { eventName: item.eventName };
    });
    // console.log(eventList);
    return eventList;
  },

  getProductCategory: async (_, args, { Bizcat_Products }) => {
    // console.log("signup vendor")
    const productsCategories = await Bizcat_Products.find({});
    return productsCategories;
  },

  getServiceCategory: async (_, args, { Bizcat_Services }) => {
    const servicesCategories = await Bizcat_Services.find({});
    // console.log(servicesCategories)
    return servicesCategories;
  },

  getRestaurantCategory: async (_, args, { Bizcat_Restaurants }) => {
    const restaurantCategories = await Bizcat_Restaurants.find({});
    // console.log(restaurantCategories)
    return {
      items: restaurantCategories[0].items,
    };
  },

  getMetroSpec: async (_, arg, { Resident }) => {
    const residentNumber = await Resident.aggregate([
      { $group: {
        _id: "$outsideBoundary",
        count: {
            $sum: 1
        }
      }
    }
    ])
    // console.log(residentNumber)
    let outsideBoundary = 0
    let insideBoundary = 0
    for(let item of residentNumber) {
      if(item._id == null) {
        // outsideBoundary = item.count
        insideBoundary = item.count

      } else {
        // insideBoundary = item.count
        outsideBoundary = item.count

      }
    }
    return { residentOutsideBoundary: outsideBoundary, 
            residentInsideBoundary: insideBoundary }
  },

  getCityHall: async(_, {}, { CityHall, Resident, Guild }) => {
    const rulingGuild = await Guild.findOne({isRulingGuild: true}) 
    const guildLeaderName = await Resident.findOne({ residentName: rulingGuild.guildLeader}).select("nickName")
    const  result = await Resident.aggregate([
      { $group: { 
                  _id: {}, 
                  might: {$sum: "$might"},
                  count: { $sum: 1 }
                }},

              ])
              // console.log('result',result)
     let cityhall = await CityHall.findOneAndUpdate({ metro: 'Great Toronto'}, 
     {$set: { 
       might: result[0].might, 
       population: result[0].count,
       governor: `[${rulingGuild.guildFullName}]${guildLeaderName.nickName}`
      }}, {new: true})
      // console.log('cityhall1',cityhall)
     if(cityhall) 
     {
       return cityhall
     } else {
      const  cityHall = await new CityHall({might: result[0].might, population: result[0].count}).save()
      // console.log('cityhall2',cityHall)

       return cityHall
     }
    
  },

  getNews: async (_, arg, {News}) => {
    const news = await News.find({})
    return news
  },

  getNewsPool: async (_, arg, {News, moment}) => {
    const news = await News.find({})

    const newsPool = news.map(item => {
      return {headline: `${item.newsTitle}: 
      ${item.headLine} 
      at ${moment(new Number(item.date)).format("MMMM Do YYYY, h:mm:ss a")}`}
    })

    return newsPool
  },

  getGuildLogos: async (_,{},{}) => {
    const dir = `./public/guildLogos/`;
    const logoFiles  = fs.readdirSync(dir);
    const logoFilesToSend = logoFiles.map(file => {
      return {logoString: file}
    })
    return logoFilesToSend
  },

  getGamePropList: async (_, {}, {GameProp}) => {
    const list = await GameProp.find({})

    // console.log(list)
    // console.log("prop list" + list)
    return list
  },

  getGameSubstituteList: async (_, {}, {GameSubstituteItem}) => {
    const list = await GameSubstituteItem.find({})
    // console.log(list)
    // console.log("substitute list" + list)
    return list
  },

  getGameShopSubstitute: async (_, {}, {GameShopSubstitute}) => {
    const itemList = await GameShopSubstitute.find({})
    return {
      shopItemCode: itemList[0].substituteItems[0].shopItemCode,
      shopItemName: itemList[0].substituteItems[0].shopItemName,
      substituteItemCode: itemList[0].substituteItems[0].substituteItemCode,
      substituteItemName: itemList[0].vendor + ' ' + itemList[0].substituteItems[0].substituteItemName,
      vendorItemCode: itemList[0].substituteItems[0].vendorItemCode,
      vendorItemPrice: itemList[0].substituteItems[0].vendorItemPrice,
      // bondCouponId: itemList[0].substituteItems[0].bondCouponId,
      vendor: itemList[0].vendor
    }
  },

  getMonsterChest: async (_, arg, { MonsterChest }) => {
    const monsterChestList = await MonsterChest.find({});
    // console.log(monsterChestList);
    return monsterChestList;
  },

  getRewardItems: async (_, args, { RewardItem }) => {
    const rewardItems = await RewardItem.find({});
    // console.log(rewardItems);
    const itemList = rewardItems.map((item) => {
      return {
        itemName: item.itemName,
        icon: item.icon,
      };
    });

    return itemList;
  },

  getGeoLocation: async (_, { residentName }, { Resident, Guild }) => {
    const resident = await Resident.findOne({ residentName }).populate({path: "guild", model: Guild, select: ['guildShortName']});
    // console.log("query geolocation");
    if (resident) {
      return {
        Lat: resident.initialLat,
        Lng: resident.initialLng,
        Username: resident.residentName,
        SilverInPocket: resident.silverCoins,
        Guild: resident.guild ? resident.guild.guildShortName : ' ',
        nickName: resident.nickName
      };
    }
  },
};
