/**
 * Mutation resolvers — flyer.
 *
 * Split out of the monolithic resolvers/Mutation.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/mutationPolicy.js.
 */
const {
  FlyerSchema,
  ItemCatalogSchema,
  SketchSchema,
  TemplateSchema,
  mongoose,
  sizeOf,
  tenantUri,
} = require("./_shared");

module.exports = {
  distributeFlyer: async (_, { input }, { ActiveFlyer, pubsub }) => {
    const {
      businessTitle,
      logo,
      businessCategory,
      flyerId,
      flyerTitle,
      flyerType,
      dateFrom,
      dateTo,
      crossBoundary,
      quantityDistributed
    } = input;
    // console.log('dateFrom', dateFrom)
    // console.log(Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const pastSavedFlyer = await SavedFlyer.findOne({
      flyerId,
    });
    // console.log(pastSavedFlyer);
    if (pastSavedFlyer) {
      await SavedFlyer.findOneAndUpdate(
        {
          flyerId,
        },
        {
          distributed: true,
          crossBoundary,
          quantityDistributed
        },
        {
          new: true,
        }
      );
      const { couponValue } = pastSavedFlyer;
      let promoInfo = " ";
      if (couponValue.length > 0) {
        let cash = "Cash Discount";
        let per = "Percentage Discount";
        couponValue.map((item) => {
          if (item.valueType == "PERCENTAGE_DISCOUNT") {
            per = per + " " + item.amount * 100 + "%";
          } else {
            cash = item.valueType + " " + `$${item.amount}`;
          }
        });
        if (per.length > 19 && cash.length > 13) {
          promoInfo = per + " " + cash;
        } else {
          promoInfo = per.length > 19 ? per : cash;
        }


        // console.log(promoInfo)

        if (couponValue) {
          const modelName = vendor + "_" + "ItemCatalog";
          const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
          for(let singleCoupon of couponValue) {
            // console.log('singleCoupon itemsBound', singleCoupon)
            if(singleCoupon.itemsBound) {
              for(let item of singleCoupon.itemsBound) {
                await ItemCatalog.findOneAndUpdate({itemCode: item.itemCode}, 
                // { $push: { boundFlyers: {flyerId, couponId: singleCoupon.couponId}}, $set: { event: 'Yes'}})
                { $set: { event: 'Yes', boundFlyers: {flyerId, couponId: singleCoupon.couponId}}})
                }
            } else if (singleCoupon.valueType == 'PERCENTAGE_DISCOUNT' && singleCoupon.isForAllItems) {
              await ItemCatalog.updateMany({},{ $set: { boundFlyers: {flyerId, couponId: singleCoupon.couponId}}})
            }
            
          }
        }
      }
      const newFlyer = {
        flyerId,
        flyerTitle,
        flyerType,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        promoInfo: flyerType === "FLYER" ? " " : promoInfo,
        crossBoundary,
        targetDistribute: false
      };

      const vendorInActive = await ActiveFlyer.findOne({
        businessTitle,
      });

      if (vendorInActive) {
        await ActiveFlyer.findOneAndUpdate(
          {
            businessTitle,
          },
          {
            $push: {
              vendorActiveFlyer: newFlyer,
            },
          }
        );
      } else {
        await new ActiveFlyer({
          businessTitle,
          businessCategory,
          logo,
          vendorActiveFlyer: newFlyer,
        }).save();
      }

      const activeFlyers = await ActiveFlyer.find({})

       pubsub.publish("UPDATE_ACTIVE_FLYERS", { 
        updateActiveFlyers: activeFlyers,
      });


      

      const addedFlyer = {
        businessTitle,
        businessCategory,
        flyerId,
        flyerTitle,
        flyerType,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        promoInfo,
        crossBoundary,
        targetDistribute: false
      };

      // Broadcast the subscription
      pubsub.publish("FLYER_ADDED", {
        flyerAdded: addedFlyer,
      });
      return addedFlyer;
    } else {
      throw new Error("This flyer does not exist!");
    }
  },

  targetDistribute: async (_, { input }, { Resident, pubsub }) => {
    const {
      residentList,
      businessTitle,
      logo,
      businessCategory,
      flyerId,
      flyerTitle,
      flyerType,
      dateFrom,
      dateTo,
      crossBoundary,
      quantityDistributed
    } = input;
    // console.log(Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const pastSavedFlyer = await SavedFlyer.findOne({
      flyerId,
    });
    // console.log(pastSavedFlyer);
    if (pastSavedFlyer) {
      await SavedFlyer.findOneAndUpdate(
        {
          flyerId,
        },
        {
          distributed: true,
          targetDistribute: true,
          crossBoundary,
          quantityDistributed
        },
        {
          new: true,
        }
      );
      const { couponValue } = pastSavedFlyer;
      let promoInfo = " ";
      if (couponValue.length > 0) {
        let cash = "Cash Discount";
        let per = "Percentage Discount";
        couponValue.map((item) => {
          if (item.valueType == "PERCENTAGE_DISCOUNT") {
            per = per + " " + item.amount * 100 + "%";
          } else {
            cash = cash + " " + `$${item.amount}`;
          }
        });
        if (per.length > 19 && cash.length > 13) {
          promoInfo = per + " " + cash;
        } else {
          promoInfo = per.length > 19 ? per : cash;
        }

        // console.log(promoInfo)

        if (couponValue) {
          const modelName = vendor + "_" + "ItemCatalog";
          const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
          for(let singleCoupon of couponValue) {
            // console.log('singleCoupon itemsBound', singleCoupon)
            if(singleCoupon.itemsBound) {
              for(let item of singleCoupon.itemsBound) {
              await ItemCatalog.findOneAndUpdate({itemCode: item.itemCode}, 
              // { $push: { boundFlyers: {flyerId, couponId: singleCoupon.couponId}}, $set: { event: 'Yes'}})
              { $set: { event: 'Yes', boundFlyers: {flyerId, couponId: singleCoupon.couponId}}})
            }
            } else if (singleCoupon.valueType == 'PERCENTAGE_DISCOUNT' && singleCoupon.isForAllItems) {
              await ItemCatalog.updateMany({},{ $set: { boundFlyers: {flyerId, couponId: singleCoupon.couponId}}})
            }
            
          }
        }
      }
      const newFlyer = {
        businessTitle,
        businessCategory,
        logo,
        flyerId,
        flyerTitle,
        flyerType,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        promoInfo: flyerType === "FLYER" ? " " : promoInfo,
        crossBoundary,
        targetDistribute: true
      };

      for(let resident of residentList){
        await Resident.findOneAndUpdate({ residentName: resident }, { $push: { targetFlyers: newFlyer }})
      }

      // const vendorInActive = await ActiveFlyer.findOne({
      //   businessTitle,
      // });

      // if (vendorInActive) {
      //   await ActiveFlyer.findOneAndUpdate(
      //     {
      //       businessTitle,
      //     },
      //     {
      //       $push: {
      //         vendorActiveFlyer: newFlyer,
      //       },
      //     }
      //   );
      // } else {
      //   await new ActiveFlyer({
      //     businessTitle,
      //     businessCategory,
      //     logo,
      //     vendorActiveFlyer: newFlyer,
      //   }).save();
      // }

      // const activeFlyers = await ActiveFlyer.find({})

      //  pubsub.publish("UPDATE_ACTIVE_FLYERS", { 
      //   updateActiveFlyers: activeFlyers,
      // });



      const addedFlyer = {
        businessTitle,
        businessCategory,
        flyerId,
        flyerTitle,
        flyerType,
        dateFrom,
        dateTo,
        promoInfo,
        crossBoundary,
        targetDistribute: true
      };

      // Broadcast the subscription
      pubsub.publish("FLYER_ADDED", {
        flyerAdded: addedFlyer,
      });
      return addedFlyer;
    } else {
      throw new Error("This flyer does not exist!");
    }
  },

  saveFlyer: async (_, { input }, {}) => {
    if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
      const {
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
        businessTitle,
        couponPages,
        flyerPage_C,
      } = input;
      // console.log(Date.now().toString());
      // FlyerSchema.plugin(beautifyUnique)
      const vendor = businessTitle.replace(/\s/g, "")
      const MONGO_URI =
        tenantUri(vendor);
      // console.log(MONGO_URI)
      const newConn = await mongoose.createConnection(MONGO_URI);
      const modelName = vendor + "_" + "SavedFlyer";
      const modelNameSketch = vendor + "_" + "SavedSketch";
      const SavedSketch = newConn.model(modelNameSketch, SketchSchema);
      const SavedFlyer = newConn.model(modelName, FlyerSchema);

      await SavedSketch.findOneAndRemove({flyerId})
     
      const newSavedFlyer = await new SavedFlyer({
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
        vendor: businessTitle,
        couponPages,
        flyerPage_C,
      }).save();
      // console.log(newSavedFlyer);
      // const sketchModel = businessTitle + "_" + "SavedSketch";
      // const SavedSketch = newConn.model(sketchModel, SketchSchema);
      // await SavedSketch.findOneAndDelete(
      //   {
      //     flyerId: newSavedFlyer.flyerId,
      //   },
      //   (err) => {
      //     // console.log(err);
      //   }
      // );

      return newSavedFlyer;
      // }
    } else {
      throw new Error(
        "This size of flyer is over limit, please downsize photos or texts"
      );
    }
  },

  saveSketch: async (_, { input }, {}) => {
    if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
      const {
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
        businessTitle,
      } = input;
      // console.log(Date.now().toString());
      const vendor = businessTitle.replace(/\s/g, "")

      const MONGO_URI =
        tenantUri(vendor);
      // console.log(MONGO_URI)
      const newConn = await mongoose.createConnection(MONGO_URI);
      // .then(() => console.log(`MongoDB ${businessTitle} database is Connected`))
      // .catch((err) => console.error(err))
      // console.log(newConn)
      const modelName = vendor + "_" + "SavedSketch";
      const SavedSketch = newConn.model(modelName, SketchSchema);
      const pastSavedSketch = await SavedSketch.findOne({
        flyerId,
      });
      const sketchDocument = {
        sketchPages,
        sketchPages_C,
        flyerId,
        flyerTitle,
        type,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
      };
      // console.log(pastSavedSketch);
      if (pastSavedSketch) {
        if (type == "FLYERCOUPON") {
          const revisedSketchPages = await SavedSketch.findOneAndUpdate(
            {
              flyerId,
            },
            {
              sketchPages,
              sketchPages_C,
              flyerTitle,
              backgroundColor,
              width,
              height,
              backgroundColor_C,
              width_C,
              height_C,
            },
            {
              new: true,
            }
          );
          // console.log(revisedSketchPages);
        } else {
          const revisedSketchPages = await SavedSketch.findOneAndUpdate(
            {
              flyerId,
            },
            {
              sketchPages,
              flyerTitle,
              backgroundColor,
              width,
              height,
            },
            {
              new: true,
            }
          );
          // console.log(revisedSketchPages);
        }
      } else {
        if (type == "FLYERCOUPON") {
          const newSavedSketch = await new SavedSketch({
            sketchPages,
            sketchPages_C,
            flyerId,
            flyerTitle,
            type,
            backgroundColor,
            width,
            height,
            backgroundColor_C,
            width_C,
            height_C,
          }).save();
        } else {
          const newSavedSketch = await new SavedSketch({
            sketchPages,
            flyerId,
            flyerTitle,
            type,
            backgroundColor,
            width,
            height,
          }).save();
        }
        // console.log(newSavedSketch);
      }
      const sketchList = await SavedSketch.find({});
      // if (sketchList.length > 0) {
      // console.log(sketchList)
      const returnedList = sketchList.map((listItem) => {
        return {
          flyerId: listItem.flyerId,
          flyerTitle: listItem.flyerTitle,
          type: listItem.type,
        };
      });
      return returnedList;
      // }
    } else {
      throw new Error(
        "This size of draft is over limit, please downsize photos or texts"
      );
    }
  },

  saveTemplate: async (_, { input }, {}) => {
    if (Math.round(sizeOf(input) / (1024 * 1024)) <= 15) {
      const {
        templatePages,
        templatePages_C,
        templateId,
        templateTagName,
        templateType,
        backgroundColor,
        width,
        height,
        backgroundColor_C,
        width_C,
        height_C,
        businessTitle,
      } = input;
      // console.log('save template' + Date.now().toString());
      const vendor = businessTitle.replace(/\s/g, "")
      const MONGO_URI =
        tenantUri(vendor);
      // console.log(MONGO_URI)
      const newConn = await mongoose.createConnection(MONGO_URI);
      const modelName = vendor + "_" + "SavedTemplate";
      const SavedTemplate = newConn.model(modelName, TemplateSchema);
      const pastSavedTemplate = await SavedTemplate.findOne({
        templateId,
      });
      // console.log(pastSavedTemplate);
      if (pastSavedTemplate) {
        const revisedTemplate = await SavedTemplate.findOneAndUpdate(
          {
            templateId,
          },
          {
            templatePages,
            templatePages_C,
            backgroundColor,
            width,
            height,
            backgroundColor_C,
            width_C,
            height_C,
          },
          {
            new: true,
          }
        );
        // console.log(revisedTemplate);
      } else {
        const newSavedTemplate = await new SavedTemplate({
          templatePages,
          templatePages_C,
          templateId,
          templateTagName,
          templateType,
          backgroundColor,
          width,
          height,
          backgroundColor_C,
          width_C,
          height_C,
        }).save();
        // console.log(newSavedSketch);
      }
      const templateList = await SavedTemplate.find({});
      // if (sketchList.length > 0) {
      // console.log(sketchList)
      const returnedList = templateList.map((listItem) => {
        return {
          templateId: listItem.templateId,
          templateTagName: listItem.templateTagName,
          templateType: listItem.templateType,
        };
      });
      return returnedList;
      // }
    } else {
      throw new Error(
        "This size of template is over limit, please downsize photos or texts"
      );
    }
  },

  updateSavedFlyer: async (_, { input }, {}) => {
    const {
      flyerId,
      dateFrom,
      dateTo,
      // quantityDistributed,
      couponValue,
      totalPages,
      businessTitle,
      setUp,
    } = input;
    // console.log(Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const pastSavedFlyer = await SavedFlyer.findOne({
      flyerId,
    });
    // console.log(pastSavedFlyer);
    if (pastSavedFlyer) {
      const updatedSavedFlyer = await SavedFlyer.findOneAndUpdate(
        {
          flyerId,
        },
        {
          dateFrom,
          dateTo,
          // quantityDistributed,
          couponValue,
          totalPages,
          setUp,
        },
        {
          new: true,
        }
      );

      // console.log(updatedSavedFlyer);
      return updatedSavedFlyer;
    } else {
      throw new Error("This flyer does not exist!");
    }
  },

  saveItemCatalog: async (_, { input }, {}) => {
    const {  itemDetailed, businessTitle } = input;
    // console.log(input)
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "ItemCatalog";
    const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
    await ItemCatalog.deleteMany({})

    for ( let item of itemDetailed) {
      // console.log(item)
      // const itemExist = await ItemCatalog.findOne({itemCode: item.itemCode})
      // if(itemExist) {
      //   await ItemCatalog.findOneAndUpdate(
      //                   {itemCode: item.itemCode},
      //                   {$set: {
      //                     subcategory: item.subcategory,
      //                     itemCode: item.itemCode,
      //                     description: item.description,
      //                     specification: item.specification,
      //                     unit: item.unit,
      //                     photo: item.photo,
      //                     rate: item.rate,
      //                     rewardSilver: item.rewardSilver,
      //                     promoRate: item.promoRate,
      //                     active: item.active,
      //                     taxRate: item.taxRate,
      //                     event: item.event
      //                   }}, [{ upsert: true }, { overwrite: true }]);
      // } else {
        await new ItemCatalog({
          subcategory: item.subcategory,
          itemCode: item.itemCode,
          description: item.description,
          specification: item.specification,
          unit: item.unit,
          photo: item.photo,
          rate: item.rate,
          rewardSilver: item.rewardSilver,
          promoRate: item.promoRate,
          taxRate: item.taxRate,
          event: item.event,
          active: item.active}).save()
      // }
     
    }

   
    // if (savedSubcategory) {
    //   const updatedSubcategory = await ItemCatalog.findOneAndUpdate(
    //     {
    //       subcategory,
    //     },
    //     {
    //       itemDetailed,
    //     },
    //     {
    //       new: true,
    //     }
    //   );

    //   if (updatedSubcategory)
    //     return {
    //       updated: true,
    //     };
    // } else {
    //   const newSubcategory = await new ItemCatalog({
    //     subcategory,
    //     itemDetailed,
    //   }).save();
    //   if (newSubcategory)
    //     return {
    //       updated: true,
    //     };
    // }
    const vendorCatalog = await ItemCatalog.find({})
    // console.log(vendorCatalog)
    return vendorCatalog
  },

  saveSubstituteItems: async (_, {vendor, dateFrom, dateTo, input}, { GameShopSubstitute }) => {
    await new GameShopSubstitute({ vendor, dateFrom, dateTo, substituteItems: input}).save()
    return { isSaved: true}
  },
};
