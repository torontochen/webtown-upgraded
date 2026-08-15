/**
 * Mutation resolvers — vendor.
 *
 * Split out of the monolithic resolvers/Mutation.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/mutationPolicy.js.
 */
const {
  ItemCatalogSchema,
  VendorPromotionEventSchema,
  bcrypt,
  conn,
  fs,
  mongoose,
  path,
  tenantUri,
} = require("./_shared");

module.exports = {
  updateVendorProfile: async (
    _,
    {
      tagline,
      businessTitle,
      email,
      password,
      businessUnitNo,
      businessStreetNo,
      businessStreetName,
      businessCity,
      businessPostalCode,
      businessPhone,
      businessFax,
      businessHours,
      businessEmail,
      logo,
      businessCategory,
      aboutUs,
      website,
      deliveryFees,
      maxDeliveryDistance,
      photoList,
      crossBoundaryBusiness,
      lat,
      lng
    },
    { Vendor }
  ) => {
    // console.log(businessTitle);
    // console.log(photoList);
    const newPassword = password;
    // console.log(password);
    const vendor = await Vendor.findOne({
      email,
    });

    const salt = bcrypt.genSaltSync(10);
    // console.log(salt);

    const hash = bcrypt.hashSync(password, salt);
    //     const dir = `./public/${businessTitle}/`;
    //     console.log(dir)
    // let updatedPicFiles = [];

    // if (fs.existsSync(dir)) {
    //   // fs.readdir(dir, (err, files) => {
    //   //   const _ = require("lodash");
    //   //   console.log(files);
    //   //   if (err) throw err;
    //   //   if (files.length > 0) {
    //   //     for (const file of files) {
    //   //       const index = _.findIndex(photoList, (item) => {
    //   //         return item == file;
    //   //       });
    //   //       if (index < 0) {
    //   //         fs.unlink(path.join(dir, file), (err) => {
    //   //           if (err) throw err;
    //   //         });
    //   //       }
    //   //     }
    //   //   }
    //   // });
    //   const _ = require("lodash");
    //   const files = fs.readdirSync(dir);
    //   console.log("files" + files);
    //   if (files.length > 0 && photoList.length > 0) {
    //     for (const file of files) {
    //       const index = _.findIndex(photoList, (item) => {
    //         return item == file;
    //       });
    //       if (index < 0) {
    //         fs.unlinkSync(path.join(dir, file));
    //       }
    //     }
    //   }
    // } else {
    //   fs.mkdirSync(dir, { recursive: true });
    // }

    // if (businessPhotos.length > 0) {
    //   businessPhotos.map(async (photo) => {
    //     const { createReadStream, filename, mimetype, encoding } = await photo;
    //     const stream = createReadStream();
    //     // const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    //     //   bucketName: businessTitle
    //     // })
    //     const newFilename =
    //       businessTitle + "-" + Date(Date.now()).toString() + "-" + filename;
    //     // const uploadStream = gridFSBucket.openUploadStream(newFilename, {
    //     //   chunkSizeBytes: 100000
    //     // })
    //     await new Promise((resolve, reject) => {
    //       stream
    //         .pipe(fs.createWriteStream(dir + newFilename))
    //         .on("error", reject)
    //         .on("finish", async () => {
    //           updatedPicFiles = fs.readdirSync(dir);
    //           console.log(updatedPicFiles);
    //           await Vendor.findOneAndUpdate(
    //             { email },
    //             { $set: { photoList: updatedPicFiles } },
    //             { new: true }
    //           );
    //           resolve();
    //         });
    //     });
    //     // return {
    //     //   id: uploadStream.id,
    //     //   filename: newFilename,
    //     //   mimetype,
    //     //   encoding
    //     // }
    //   });
    //   const vendorUpdated = await Vendor.findOneAndUpdate(
    //     {
    //       email,
    //     },
    //     {
    //       $set: {
    //         tagline,
    //         businessTitle,
    //         email,
    //         businessUnitNo,
    //         businessStreetNo,
    //         businessStreetName,
    //         businessCity,
    //         businessPostalCode,
    //         businessPhone,
    //         businessFax,
    //         businessEmail,
    //         logo,
    //         businessCategory,
    //         aboutUs,
    //         website,
    //         password: newPassword ? hash : vendor.password,
    //       },
    //     },
    //     {
    //       new: true,
    //     }
    //   );
    //   return vendorUpdated;
    // } else {
    //   updatedPicFiles  = fs.readdirSync(dir);
    //   console.log(updatedPicFiles)

    const vendorUpdated = await Vendor.findOneAndUpdate(
      {
        email,
      },
      {
        $set: {
          tagline,
          businessTitle,
          email,
          businessUnitNo,
          businessStreetNo,
          businessStreetName,
          businessCity,
          businessPostalCode,
          businessPhone,
          businessFax,
          businessEmail,
          businessHours,
          logo,
          businessCategory,
          aboutUs,
          website,
          deliveryFees,
           maxDeliveryDistance,
          password: newPassword ? hash : vendor.password,
          photoList,
          crossBoundaryBusiness,
          lat,
          lng
        },
      },
      {
        new: true,
      }
    );

    return vendorUpdated;
    
  },

  updateGalleryFiles: async (_, { vendor, photoList }, { Vendor }) => {
    //  const dir = `./public/${vendor}/`;
    // if(fileToDelete) {
    // fs.unlinkSync(dir + fileToDelete)
    //  const vendorUpdated = await Vendor.findOneAndUpdate({businessTitle: vendor}, { $pull: { photoList: fileToDelete}}, {new: true})
    //  const fileList = vendorUpdated.photoList.map(item => {
    //     return { filename: item}
    //   })
     

    //   return fileList;
    // }

    // if(filesToAdd.length > 0) {
    //  const list = filesToAdd.map(async (photo) => {
    //     const { createReadStream, filename, mimetype, encoding } = await photo;
    //     const stream = createReadStream();
    //     // const gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    //     //   bucketName: businessTitle
    //     // })
    //     const newFilename =
    //       vendor + "-" + Date(Date.now()).toString() + "-" + filename;
    //     // const uploadStream = gridFSBucket.openUploadStream(newFilename, {
    //     //   chunkSizeBytes: 100000
    //     // })
    //     await new Promise((resolve, reject) => {
    //       stream
    //         .pipe(fs.createWriteStream(dir + newFilename))
    //         .on("error", reject)
    //         .on("finish", async () => {
    //           updatedPicFiles = fs.readdirSync(dir);
    //           console.log(updatedPicFiles);
    //         await Vendor.findOneAndUpdate(
    //               { businessTitle: vendor },
    //               { $set: { photoList: updatedPicFiles } },
    //               { new: true }
    //             );
                
    //           resolve();
    //         });
    //     });
    //     // return {
    //     //   id: uploadStream.id,
    //     //   filename: newFilename,
    //     //   mimetype,
    //     //   encoding
    //     // }
    //     return {filename: newFilename }
    //   });

    //   const vendorUpdated = await Vendor.findOneAndUpdate({businessTitle: vendor})

    //   const fileList = vendorUpdated.photoList.map(item => {
    //     return { filename: item}
    //   })
     

    //   return [...fileList, ...list]
    // }
    const vendorUpdated = await Vendor.findOneAndUpdate({businessTitle: vendor}, {photoList})


    return {photoList: vendorUpdated.photoList}
  },

  updateMonsterChest: async (_, { 
    vendor,
    promotionItemTitle,
    promotionItemId,
    promotionType,
    rewardItems}, { MonsterChest , pubsub}) => {
      const monsterChestSaved = await new MonsterChest({
        vendor,
        promotionItemTitle,
        promotionItemId,
        promotionType,
        rewardItems
      }).save();

      pubsub.publish("MONSTER_CHEST_ADDED", {
        monsterChestAdded: monsterChestSaved,
      });

      if (monsterChestSaved) {
        return { saved: true}
      }
  },

  createPromotionEvent: async (_, {input}  , { PromotionEvent, Vendor, News, pubsub }) => {
    const {
      vendor,
      vendorName,
      eventType,
      eventPhoto,
      eventTitle,
      eventInstruction,
      promotionItems,
      dateFrom,
      dateTo,
      postOnPortal
    } = input
    // console.log(dateFrom)
    // console.log(dateTo)
    const newsTitle = `(${vendorName}) ${eventType}: `
    const headLine = `${eventTitle}   From: ${dateFrom} To: ${dateTo}`
    // console.log(headLine)
    await new News({newsTitle, headLine, date: Date.now()}).save()
    pubsub.publish("NEWS_ADDED", {newsAdded: {newsTitle, headLine, date: Date.now().toString()}})

    const newVendorName = vendorName.replace(/\s/g, "")

      const MONGO_URI =
        tenantUri(newVendorName);

      const newConn = await mongoose.createConnection(MONGO_URI);
      const modelNameEvent = newVendorName + "_" + "PromotionEvent";
      const VendorPromotionEvent = newConn.model(modelNameEvent, VendorPromotionEventSchema);

     
    await new VendorPromotionEvent({vendorId: vendor,
                                      eventType,
                                      eventPhoto,
                                      eventTitle,
                                      eventInstruction,
                                      promotionItems,
                                      dateFrom,
                                      dateTo,
                                      postOnPortal}).save()
  
    await new PromotionEvent({vendorId: vendor,
                              eventType,
                              eventPhoto,
                              eventTitle,
                              eventInstruction,
                              dateFrom,
                              dateTo,
                              }).save()

   const eventList  = await PromotionEvent.find({}).populate({path: 'vendorId', model: Vendor}) 

   const modelName = newVendorName + "_" + "ItemCatalog";
   const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);

   for ( let item of promotionItems) {
     // console.log(item)
       await ItemCatalog.findOneAndUpdate(
                       {itemCode: item},
                       {$set: {
                         event: 'Yes'
                       }});
    }

     const promotionEvents = eventList.map(event => {
       return {
        vendor: event.vendorId.businessTitle,
        vendorUnitNo: event.vendorId.businessUnitNo,
        vendorStreetNo: event.vendorId.businessStreetNo,
        vendorStreetName: event.vendorId.businessStreetName,
        vendorCity: event.vendorId.businessCity,
        vendorState: event.vendorId.businessState,
        vendorCountry: event.vendorId.businessCountry,
        vendorPhone: event.vendorId.businessPhone[0],
        vendorEmail: event.vendorId.businessEmail,
        vendorRating: event.vendorId.rating,
        vendorCategory: event.vendorId.businessCategory,
        vendorLogo: event.vendorId.logo,
        eventType: event.eventType,
        eventPhoto: event.eventPhoto,
        eventTitle: event.eventTitle,
        eventInstruction: event.eventInstruction,
        dateFrom: event.dateFrom,
        dateTo: event.dateTo,
        eventId: event._id.toString(),
        lat: event.vendorId.lat,
        lng: event.vendorId.lng
       }
     })
    // console.log(promotionEvents)

        return promotionEvents
  },

  callGroupPurchase: async(_, {newsTitle, headLine, date}, {News, pubsub}) => {
   
    await new News({newsTitle, headLine, date}).save()
    pubsub.publish("NEWS_ADDED", {newsAdded: {newsTitle, headLine, date: Date.now().toString()}})
    return {newsTitle, headLine, date}
  },
};
