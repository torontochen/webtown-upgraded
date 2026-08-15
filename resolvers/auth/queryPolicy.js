const { PUBLIC, RESIDENT, VENDOR, AUTHENTICATED } = require("./guards");

/**
 * Access policy for every query (Phase 1c).
 *
 * Same table format and same fail-closed boot check as MUTATION_POLICY.
 *
 * The hard constraint here is app startup: src/main.js dispatches 15 queries
 * from the root component's created() hook, before anyone has signed in. Those
 * must stay PUBLIC or the app breaks on load for anonymous visitors. They are
 * marked "boot" below.
 *
 * getCurrentResident / getCurrentVendor must also stay PUBLIC: they already
 * check `currentUser` internally and return null when absent, which is how the
 * client decides whether to show a signed-in UI. Guarding them would turn a
 * normal anonymous page load into an error.
 */
const QUERY_POLICY = {
  // --- Signup / boot availability checks --------------------------------
  // These are user-enumeration oracles by nature — that is what a "is this
  // name taken?" check is. They return booleans only, and the signup form
  // cannot work without them. Rate limiting is the appropriate control here,
  // not authentication; see PROJECT_NOTES.md.
  checkEmail: PUBLIC,
  checkVendorEmail: PUBLIC,
  checkResidentName: PUBLIC,
  checkBusinessTitle: PUBLIC,
  checkGuildName: PUBLIC,
  checkSavedFingerPrint: PUBLIC, // boot

  // --- Session probes (return null when anonymous) -----------------------
  getCurrentResident: PUBLIC, // boot
  getCurrentVendor: PUBLIC, // boot

  // --- Boot-time reference data ------------------------------------------
  getActiveFlyer: PUBLIC, // boot
  getPets: PUBLIC, // boot
  getEventCategory: PUBLIC, // boot
  getPromotionEvents: PUBLIC, // boot
  getAllGuilds: PUBLIC, // boot
  getAllGuildDeals: PUBLIC, // boot
  getMetroSpec: PUBLIC, // boot
  getCityHall: PUBLIC, // boot
  getProductCategory: PUBLIC, // boot
  getServiceCategory: PUBLIC, // boot
  getRestaurantCategory: PUBLIC, // boot
  getVendorList: PUBLIC, // boot
  getNews: PUBLIC, // boot

  // --- Public reference / game data --------------------------------------
  getNewsPool: PUBLIC,
  getGuildLogos: PUBLIC,
  getGamePropList: PUBLIC,
  getGameSubstituteList: PUBLIC,
  getGameShopSubstitute: PUBLIC,
  getMonsterChest: PUBLIC,
  getRewardItems: PUBLIC,

  // --- Public storefront --------------------------------------------------
  // A customer browses vendors before signing in, so these stay open.
  getCustomerRatings: PUBLIC,
  getProductRatings: PUBLIC,
  getSingleItemRating: PUBLIC,
  getItemCatalog: PUBLIC,
  getVendorSearchResult: PUBLIC,
  getVendorFlyers: PUBLIC,
  getVendorGuildDeals: PUBLIC,
  getVendorPromotionEvents: PUBLIC,
  getVendorInterface: PUBLIC,
  getPickupAddress: PUBLIC,
  getSingleCoupon: PUBLIC,
  searchAvailableDeals: PUBLIC,

  // Records a flyer read against `resident`. Left unpinned because vendors
  // preview their own flyers through this same query, and pinning to the
  // caller would break that. Closing anonymous access removes the abuse path
  // that mattered; see PROJECT_NOTES.md.
  getSelectedFlyerClientView: AUTHENTICATED,

  // --- Costs money --------------------------------------------------------
  // Calls OpenAI with a client-supplied message array. Unauthenticated, this
  // let anyone bill the project's API key without limit.
  getAIResponse: AUTHENTICATED,

  // --- Resident-owned data ------------------------------------------------
  getResidentOrders: { policy: RESIDENT, own: { resident: "residentName" } },
  getShoppingCart: { policy: RESIDENT, own: { resident: "residentName" } },
  getGeoLocation: { policy: RESIDENT, own: { residentName: "residentName" } },

  // --- Guild-scoped -------------------------------------------------------
  getGuildChatMessages: {
    policy: RESIDENT,
    role: { kind: "guildMember", by: "guildFullName", arg: "guildFullName" },
  },
  getGuildDealsStatus: {
    policy: RESIDENT,
    role: { kind: "guildMember", by: "guildFullName", arg: "guildFullName" },
  },

  // --- Vendor-owned data --------------------------------------------------
  getVendorOrders: { policy: VENDOR, own: { vendor: "businessTitle" } },
  getVendorSalesInfo: { policy: VENDOR, own: { vendor: "businessTitle" } },
  getVendorSettlementRecords: { policy: VENDOR, own: { vendor: "businessTitle" } },
  getVendorCheckoutInfos: { policy: VENDOR, own: { vendor: "businessTitle" } },
  // Only vendor components call this (VendorFlyers, VendorHomePage,
  // VendorProductService) — it is the vendor's own catalog management view.
  // getItemCatalog is the public browse equivalent.
  getAllItemsCatalog: { policy: VENDOR, own: { businessTitle: "businessTitle" } },
  getSketchList: { policy: VENDOR, own: { businessTitle: "businessTitle" } },
  getFlyerList: { policy: VENDOR, own: { businessTitle: "businessTitle" } },
  getTemplateList: { policy: VENDOR, own: { businessTitle: "businessTitle" } },
  getSelectedTemplate: { policy: VENDOR, own: { businessTitle: "businessTitle" } },
  getSelectedSketch: { policy: VENDOR, own: { businessTitle: "businessTitle" } },
  setUpFlyer: { policy: VENDOR, own: { businessTitle: "businessTitle" } },
  checkItemCode: { policy: VENDOR, own: { vendor: "businessTitle" } },

  // Demographic search across residents, for flyer targeting.
  getTargetDistributeResident: VENDOR,

  // Returned every resident's residentName, firstName and lastName to any
  // anonymous caller — a full dump of the user base's real names. It has no
  // caller anywhere in src/, so this is dead code; locked to vendors for now
  // and flagged for deletion in Phase 5.
  getResidentList: VENDOR,
};

module.exports = { QUERY_POLICY };
