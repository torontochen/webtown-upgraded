/**
 * Query resolvers — availability.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */
const {
  ItemCatalogSchema,
  mongoose,
  tenantUri,
} = require("./_shared");

module.exports = {
  checkEmail: async (_, { email }, { Resident }) => {
    // console.log(email);
    const emailTrue = await Resident.findOne({
      email,
    });
    if (emailTrue) {
      return {
        emailVal: true,
      };
    }
    return {
      emailVal: false,
    };
  },

  checkVendorEmail: async (_, { vendorEmail }, { Vendor }) => {
    // console.log(vendorEmail);
    const vendorEmailTrue = await Vendor.findOne({
      email: vendorEmail,
    });
    // console.log(vendorEmailTrue)
    if (vendorEmailTrue) {
      return {
        vendorEmailVal: true,
      };
    }
    return {
      vendorEmailVal: false,
    };
  },

  checkResidentName: async (_, { residentName, nickName }, { Resident }) => {
    // console.log(email);
    // let  residentNameTrue
    // if(nameType == "residentName") {
    //    residentNameTrue = await Resident.findOne({
    //   residentName
    // });
    // } else {
     const   residentNameTrue = await Resident.findOne({
      nickName
    });
    // }
    
    if (residentNameTrue && residentNameTrue.residentName !== residentName) {
      return {
        residentNameVal: true,
      };
    }
    return {
      residentNameVal: false,
    };
  },

  checkBusinessTitle: async (_, { businessTitle }, { Vendor }) => {
    // console.log(email);
    const businessTitleTrue = await Vendor.findOne({
      businessTitle,
    });
    if (businessTitleTrue) {
      return {
        businessTitleVal: true,
      };
    } else {
      return {
        businessTitleVal: false,
      };
    }
  },

  checkGuildName: async (_, {guildName, nameType}, {Guild}) => {
    let guild
    if(nameType == 'fullName') {
       guild = await Guild.findOne({guildFullName: guildName})
    } else {
       guild = await Guild.findOne({guildShortName: guildName})
    }
    return guild ? { guildNameIsOk: false } : { guildNameIsOk: true }    
  },

  checkItemCode: async (_, {vendor, itemCode}, {}) => {
    const newVendor = vendor.replace(/\s/g, "")
    const MONGO_URI =
      tenantUri(newVendor);
    const newConn = await mongoose.createConnection(MONGO_URI);
    const modelName = newVendor + "_" + "ItemCatalog";
    const ItemCatalog = newConn.model(modelName, ItemCatalogSchema);
    const itemExist = await ItemCatalog.findOne({ itemCode });
    return { ok: itemExist ? true : false }
  },

  checkSavedFingerPrint: async (_, { fingerPrint }, { Resident, Vendor }) => {
    const resident = await Resident.findOne({
      savedFingerPrint: fingerPrint,
    });
    const vendor = await Vendor.findOne({
      savedFingerPrint: fingerPrint,
    });
    if (resident || vendor) {
      return { fingerPrintIsSaved: true };
    } else {
      return { fingerPrintIsSaved: false };
    }
  },
};
