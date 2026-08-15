/**
 * Query resolvers — flyer.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */
const {
  FlyerSchema,
  SketchSchema,
  TemplateSchema,
  mongoose,
  puppeteer,
  tenantUri,
} = require("./_shared");

module.exports = {
  getActiveFlyer: async (_, args, { ActiveFlyer }) => {

    await ActiveFlyer.updateMany(
      {},
      {
        $pull: {
          vendorActiveFlyer: {
            dateTo: {
              $lt: Date.now(),
            },
          },
        },
      }
    );
    const activeFlyer = await ActiveFlyer.find({});
    // console.log(activeFlyer)
    return activeFlyer;
  },

  getFlyerList: async (_, { businessTitle }, {}) => {
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const flyerList = await SavedFlyer.find({});
    if (flyerList.length > 0) {
      const returnedList = flyerList.map((listItem) => {
        return {
          flyerId: listItem.flyerId,
          flyerTitle: listItem.flyerTitle,
          type: listItem.type,
          setUp: listItem.setUp,
          distributed: listItem.distributed,
          crossBoundary: listItem.crossBoundary,
          targetDistribute: listItem.targetDistribute
        };
      });
      return returnedList;
    }
  },

  getSketchList: async (_, { businessTitle }, {}) => {
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedSketch";
    const SavedSketch = newConn.model(modelName, SketchSchema);
    const sketchList = await SavedSketch.find({});
    if (sketchList.length > 0) {
      const returnedList = sketchList.map((listItem) => {
        return {
          flyerId: listItem.flyerId,
          flyerTitle: listItem.flyerTitle,
          type: listItem.type,
        };
      });
      return returnedList;
    }
  },

  getTemplateList: async (_, { businessTitle }, {}) => {
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedTemplate";
    const SavedTemplate = newConn.model(modelName, TemplateSchema);
    const templateList = await SavedTemplate.find({});
    if (templateList.length > 0) {
      const returnedList = templateList.map((listItem) => {
        return {
          templateId: listItem.templateId,
          templateTagName: listItem.templateTagName,
          templateType: listItem.templateType,
        };
      });
      return returnedList;
    }
  },

  getSelectedTemplate: async (_, { templateId, businessTitle, time }, {}) => {
    // console.log('select template' + Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedTemplate";
    const SavedTemplate = newConn.model(modelName, TemplateSchema);
    const selectedTemplate = await SavedTemplate.findOne({
      templateId,
    });
    // console.log(selectedTemplate);
    if (selectedTemplate) {
      return {
        _id: selectedTemplate._id,
        sketchPages: selectedTemplate.templatePages,
        sketchPages_C: selectedTemplate.templatePages_C,
        flyerId: selectedTemplate.templateId,
        flyerTitle: selectedTemplate.templateTagName,
        type: selectedTemplate.templateType,
        backgroundColor: selectedTemplate.backgroundColor,
        backgroundColor_C: selectedTemplate.backgroundColor_C,
        width: selectedTemplate.width,
        height: selectedTemplate.height,
        width_C: selectedTemplate.width_C,
        height_C: selectedTemplate.height_C,
        origin: "template",
      };
    }
  },

  getSelectedSketch: async (_, { flyerId, businessTitle, time }, {}) => {
    // console.log(Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedSketch";
    const SavedSketch = newConn.model(modelName, SketchSchema);
    const selectedSketch = await SavedSketch.findOne({
      flyerId,
    });
    // console.log(selectedSketch);
    if (selectedSketch) {
      return {
        _id: selectedSketch._id,
        sketchPages: selectedSketch.sketchPages,
        sketchPages_C: selectedSketch.sketchPages_C,
        flyerId: selectedSketch.flyerId,
        flyerTitle: selectedSketch.flyerTitle,
        type: selectedSketch.type,
        backgroundColor: selectedSketch.backgroundColor,
        width: selectedSketch.width,
        height: selectedSketch.height,
        backgroundColor_C: selectedSketch.backgroundColor_C,
        width_C: selectedSketch.width_C,
        height_C: selectedSketch.height_C,
        origin: "sketch",
      };
    }
  },

  getSelectedFlyerClientView: async (
    _,
    { flyerId, businessTitle, time, resident },
    {Resident}
  ) => {
    // console.log('select template' + Date.now().toString());
    // console.log('resident', resident)
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    // console.log(flyerId)

   
    const residentInfo = await Resident.findOneAndUpdate({residentName: resident}, {$addToSet: { flyersRead: flyerId}}, {new: true})
  //  console.log('usedCoupons', residentInfo.usedCoupons)
    const selectedFlyer = await SavedFlyer.findOneAndUpdate({
      flyerId,
    }, {$inc: { quantityRead: 1}});
    // console.log("selected flyer 957", selectedFlyer);
    if (selectedFlyer) {
      const {
        couponPages,
        flyerPage_C,
        width,
        height,
        width_C,
        height_C,
        type,
        flyerTitle,
        vendor,
        couponValue,
        flyerId
      } = selectedFlyer;
      // console.log('couponValue', couponValue)
      const previewArray =
        flyerPage_C.length > 0 ? [...flyerPage_C, ...couponPages] : couponPages;
      const browser = await puppeteer.launch();
      let pageView = [];
      // console.log('previewArray', previewArray)
      // console.log('previewArray length', previewArray.length)
      for (let i = 0; i < previewArray.length; i++) {
        const couponType = (type== 'FLYER' || type == 'FLYERCOUPON') && i < flyerPage_C.length ? 'FLYERPAGE' : 'COUPONPAGE'
        if(couponType == 'COUPONPAGE') {
          if(type == 'FLYERCOUPON') {
            const index = residentInfo.usedCoupons.findIndex(item => couponValue[i-1].couponId == item.couponId && flyerId == item.flyerId)
            if (index >= 0 && couponValue[i-1].oneTimeUsage) { continue }
          } else {
            // console.log('couponId',couponValue[i].couponId)
            const index = residentInfo.usedCoupons.findIndex(item => couponValue[i].couponId == item.couponId && flyerId == item.flyerId)
            // console.log('index', index)
            if (index >= 0 && couponValue[i].oneTimeUsage) { 

              continue }
          }
        }
        const page = await browser.newPage();
        // console.log('page',page)
        const viewPortWidth = flyerPage_C.length > 0 && i <= flyerPage_C.length - 1
                          ? width_C + 150
                          : width + 150
        const viewPortHeight =   flyerPage_C.length > 0 && i <= flyerPage_C.length - 1
                          ? height_C + 150
                          : height + 150             
        await page.setViewport({
                  width: viewPortWidth,
                  height: viewPortHeight,
                  deviceScaleFactor: 2
                });
        // console.log(previewArray[i].previewString)

        await page.setContent( previewArray[i].previewString );

        const base64 = await page.screenshot({
          encoding: "base64",
          // omitBackground: true,
          quality: 100,
          type: "jpeg",
          clip: {
            x: 0,
            y: 0,
            width: viewPortWidth,
            height: viewPortHeight
          },
        });
        // console.log(base64)
        pageView.push({
          vendor,
          flyerId: flyerId,
          couponId: previewArray[i].id,
          base64,
          width:
            flyerPage_C.length > 0 && i <= flyerPage_C.length - 1
              ? width_C
              : width,
          height:
            flyerPage_C.length > 0 && i <= flyerPage_C.length - 1
              ? height_C
              : height,
          flyerType: type,
          couponType,
          flyerTitle,
          couponTitle: couponType == 'COUPONPAGE' && type == 'FLYERCOUPON' ? couponValue[i - 1].couponTitle : couponType == 'COUPONPAGE' ? couponValue[i].couponTitle : ''
        });
      }
      await browser.close();
      return pageView
    }
  },

  setUpFlyer: async (_, { flyerId, businessTitle, time }, {}) => {
    // console.log('select template' + Date.now().toString());
    const vendor = businessTitle.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(vendor);
    // console.log(MONGO_URI)
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = vendor + "_" + "SavedFlyer";
    const SavedFlyer = newConn.model(modelName, FlyerSchema);
    const selectedFlyer = await SavedFlyer.findOne({
      flyerId
    });
    // console.log(selectedFlyer);
    if (selectedFlyer) {
      return selectedFlyer;
    }
  },
};
