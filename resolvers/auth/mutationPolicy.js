const { PUBLIC, RESIDENT, VENDOR, AUTHENTICATED } = require("./guards");

/**
 * Access policy for every mutation.
 *
 * This table is the complete, auditable statement of who may invoke what.
 * `applyPolicy` fails at boot if any mutation resolver is missing an entry, so
 * a new mutation cannot ship unguarded by accident — the default is closed.
 *
 * Phase 1a scope: "is the caller authenticated, and of the right kind?"
 * Phase 1b adds ownership ("is this *your* record?") and roles ("are you a
 * guild officer / city admin?"). Mutations needing that second layer are
 * marked OWNERSHIP or ROLE below and still carry a coarse guard today.
 */
const MUTATION_POLICY = {
  // --- Unauthenticated by necessity -------------------------------------
  signupResident: PUBLIC,
  signupVendor: PUBLIC,
  signinResident: PUBLIC,
  signinVendor: PUBLIC,

  // --- Resident actions --------------------------------------------------
  changePostalCode: RESIDENT, // OWNERSHIP: trusts `email` arg
  crackEgg: RESIDENT, // OWNERSHIP: trusts `resident`; mints silver
  feedPet: RESIDENT, // OWNERSHIP: trusts `residentName`
  gainLoseSilver: RESIDENT, // OWNERSHIP: trusts `winner`/`loser`; moves silver
  placeOrder: RESIDENT, // OWNERSHIP: trusts `resident`
  prepay: RESIDENT, // OWNERSHIP: trusts `resident`
  saveCustomerRating: RESIDENT, // OWNERSHIP: trusts `residentId`
  saveSingleItemRating: RESIDENT, // OWNERSHIP: trusts `residentId`
  saveShoppingCart: RESIDENT, // OWNERSHIP: trusts `resident`
  updateShoppingCart: RESIDENT, // OWNERSHIP: trusts `resident`
  saveGuildChat: RESIDENT, // OWNERSHIP: trusts `residentId`
  sendWish: RESIDENT, // OWNERSHIP: trusts `sender`
  stashFlyer: RESIDENT, // OWNERSHIP: trusts `residentName`
  stashMonsterChestItems: RESIDENT, // OWNERSHIP: trusts `playerName`
  updateAvatar: RESIDENT, // OWNERSHIP: trusts `email`
  updateProfile: RESIDENT, // OWNERSHIP: trusts `residentId`; resets password
  updatePetExpSilver: RESIDENT, // OWNERSHIP: trusts `residentName`
  updatePetExpSilverStash: RESIDENT, // OWNERSHIP: trusts `residentName`
  updateResidentSliver: RESIDENT, // OWNERSHIP: trusts `resident`; moves silver
  updateStashedFlyers: RESIDENT, // OWNERSHIP: trusts `residentName`

  // --- Guild actions (resident principals) -------------------------------
  startGuild: RESIDENT,
  joinGuild: RESIDENT, // OWNERSHIP: trusts `residentName`
  quitGuild: RESIDENT, // OWNERSHIP: trusts `residentName`
  allyGuild: RESIDENT, // ROLE: should be guild leader
  disally: RESIDENT, // ROLE: should be guild leader
  editGuild: RESIDENT, // ROLE: should be guild leader
  kickGuildMember: RESIDENT, // ROLE: should be guild officer
  promoteGuildMember: RESIDENT, // ROLE: should be guild officer
  rewardGuildMember: RESIDENT, // ROLE: should be guild officer; moves silver
  transferGuildLeaderRemun: RESIDENT, // ROLE: should be guild leader
  transferGuildLeadership: RESIDENT, // ROLE: should be guild leader

  // --- Vendor actions ----------------------------------------------------
  callGroupPurchase: VENDOR, // publishes a News item to all clients
  createPromotionEvent: VENDOR,
  commitGuildDeals: VENDOR,
  distributeFlyer: VENDOR,
  targetDistribute: VENDOR,
  fulfill: VENDOR, // OWNERSHIP: trusts `vendor`
  saveFlyer: VENDOR,
  saveSketch: VENDOR,
  saveTemplate: VENDOR,
  saveItemCatalog: VENDOR,
  saveGuildDeals: VENDOR,
  saveSubstituteItems: VENDOR, // OWNERSHIP: trusts `vendor`
  toggleGuildDealActive: VENDOR,
  updateGalleryFiles: VENDOR, // OWNERSHIP: trusts `vendor`
  updateMonsterChest: VENDOR, // OWNERSHIP: trusts `vendor`
  updateSavedFlyer: VENDOR,
  updateVendorProfile: VENDOR, // OWNERSHIP: trusts `email`; resets password

  // --- Either principal --------------------------------------------------
  cancel: AUTHENTICATED, // both sides of an order may cancel
  confirm: AUTHENTICATED,
  dispute: AUTHENTICATED,
  readMessage: AUTHENTICATED, // OWNERSHIP: trusts `receiver`
  sendMessage: AUTHENTICATED, // OWNERSHIP: trusts `sender`
  savePrepaidVendorItem: AUTHENTICATED, // OWNERSHIP: builds a Mongo URI from `resident`

  // --- Privileged / operational -----------------------------------------
  // ROLE: city-hall administration. Debits the treasury and credits every
  // resident in one call. Needs a real admin role — added in Phase 1b.
  distributeWelfare: AUTHENTICATED,
};

module.exports = { MUTATION_POLICY };
