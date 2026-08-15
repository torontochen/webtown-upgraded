const { PUBLIC, RESIDENT, VENDOR, AUTHENTICATED } = require("./guards");

/**
 * Access policy for every mutation. This table is the complete, auditable
 * statement of who may invoke what, and on whose data.
 *
 * `applyPolicy` fails at boot if any mutation resolver is missing an entry, so
 * a new mutation cannot ship unguarded by accident — the default is closed.
 *
 * An entry is either a bare policy constant, or an object:
 *
 *   policy    (required) PUBLIC | RESIDENT | VENDOR | AUTHENTICATED
 *
 *   own       Identity arguments to overwrite from the token, as
 *             { "<argPath>": "<claimKind>" }. Dotted paths reach into input
 *             objects. The client's value is *discarded*, not compared —
 *             substitution leaves nothing to get wrong.
 *             Claim kinds: residentName | email | businessTitle |
 *                          principalName | residentId | vendorId
 *
 *   resource  Ownership check for mutations that only carry a record id:
 *             { model, idArg, field, claim }
 *
 *   role      { kind: governor | guildLeader | guildMember, by, arg }
 *
 * Guild management is gated on Guild.guildLeader rather than the numeric
 * `rank` field. `guildRank` is [1,2,3,4] in the client with joiners set to 1
 * and no label mapping anywhere in the codebase, so which end is senior is
 * genuinely ambiguous — guessing wrong would let brand-new members kick people.
 * See PROJECT_NOTES.md; widening this to officers is a one-line change here.
 */
const MUTATION_POLICY = {
  // --- Unauthenticated by necessity -------------------------------------
  signupResident: PUBLIC,
  signupVendor: PUBLIC,
  signinResident: PUBLIC,
  signinVendor: PUBLIC,

  // --- Resident: identity taken from the token --------------------------
  changePostalCode: { policy: RESIDENT, own: { email: "email" } },
  crackEgg: { policy: RESIDENT, own: { resident: "residentName" } },
  feedPet: { policy: RESIDENT, own: { residentName: "residentName" } },
  placeOrder: { policy: RESIDENT, own: { resident: "residentName" } },
  prepay: { policy: RESIDENT, own: { resident: "residentName" } },
  saveCustomerRating: { policy: RESIDENT, own: { residentId: "residentId" } },
  saveSingleItemRating: { policy: RESIDENT, own: { residentId: "residentId" } },
  saveShoppingCart: { policy: RESIDENT, own: { resident: "residentName" } },
  updateShoppingCart: { policy: RESIDENT, own: { resident: "residentName" } },
  saveGuildChat: { policy: RESIDENT, own: { residentId: "residentId" } },
  sendWish: { policy: RESIDENT, own: { sender: "residentName" } },
  stashFlyer: { policy: RESIDENT, own: { residentName: "residentName" } },
  stashMonsterChestItems: { policy: RESIDENT, own: { playerName: "residentName" } },
  updateAvatar: { policy: RESIDENT, own: { email: "email" } },
  updateProfile: { policy: RESIDENT, own: { residentId: "residentId" } },
  updatePetExpSilver: { policy: RESIDENT, own: { residentName: "residentName" } },
  updatePetExpSilverStash: { policy: RESIDENT, own: { residentName: "residentName" } },
  updateResidentSliver: { policy: RESIDENT, own: { resident: "residentName" } },
  updateStashedFlyers: { policy: RESIDENT, own: { residentName: "residentName" } },

  // gainLoseSilver moves silver between two named residents. `winner` is
  // pinned to the caller so it can only ever credit yourself from a game you
  // took part in; `loser` cannot be derived from the token and remains a
  // client value. See PROJECT_NOTES.md — this one wants a server-side game
  // result, not an ownership check.
  gainLoseSilver: { policy: RESIDENT, own: { winner: "residentName" } },

  // --- Guild: membership and leadership ---------------------------------
  startGuild: { policy: RESIDENT, own: { guildLeader: "residentName" } },
  joinGuild: { policy: RESIDENT, own: { residentName: "residentName" } },
  quitGuild: { policy: RESIDENT, own: { residentName: "residentName" } },

  allyGuild: {
    policy: RESIDENT,
    role: { kind: "guildLeader", by: "guildFullName", arg: "guildAsk" },
  },
  disally: {
    policy: RESIDENT,
    role: { kind: "guildLeader", by: "guildFullName", arg: "guildAsk" },
  },
  editGuild: {
    policy: RESIDENT,
    role: { kind: "guildLeader", by: "guildId", arg: "guildId" },
  },
  kickGuildMember: {
    policy: RESIDENT,
    role: { kind: "guildLeader", by: "guildFullName", arg: "guild" },
  },
  promoteGuildMember: {
    policy: RESIDENT,
    role: { kind: "guildLeader", by: "guildFullName", arg: "guild" },
  },
  rewardGuildMember: {
    policy: RESIDENT,
    role: { kind: "guildLeader", by: "guildFullName", arg: "guild" },
  },
  transferGuildLeaderRemun: {
    policy: RESIDENT,
    role: { kind: "guildLeader", by: "guildFullName", arg: "guild" },
  },
  transferGuildLeadership: {
    policy: RESIDENT,
    own: { leader: "residentName" },
    role: { kind: "guildLeader", by: "guildId", arg: "guildId" },
  },

  // Commits a guild to a set of vendor deals and opens a per-guild Mongo
  // connection built from guildFullName. Reclassified from VENDOR in Phase 1a
  // — the input carries a guild, not a vendor.
  commitGuildDeals: {
    policy: RESIDENT,
    role: { kind: "guildMember", by: "guildFullName", arg: "input.guildFullName" },
  },

  // --- Vendor: identity taken from the token ----------------------------
  createPromotionEvent: { policy: VENDOR, own: { "input.vendor": "vendorId" } },
  distributeFlyer: { policy: VENDOR, own: { "input.businessTitle": "businessTitle" } },
  targetDistribute: { policy: VENDOR, own: { "input.businessTitle": "businessTitle" } },
  saveFlyer: { policy: VENDOR, own: { "input.businessTitle": "businessTitle" } },
  saveSketch: { policy: VENDOR, own: { "input.businessTitle": "businessTitle" } },
  saveTemplate: { policy: VENDOR, own: { "input.businessTitle": "businessTitle" } },
  saveItemCatalog: { policy: VENDOR, own: { "input.businessTitle": "businessTitle" } },
  updateSavedFlyer: { policy: VENDOR, own: { "input.businessTitle": "businessTitle" } },
  saveGuildDeals: { policy: VENDOR, own: { "input.vendor": "businessTitle" } },
  fulfill: { policy: VENDOR, own: { vendor: "businessTitle" } },
  saveSubstituteItems: { policy: VENDOR, own: { vendor: "businessTitle" } },
  updateGalleryFiles: { policy: VENDOR, own: { vendor: "businessTitle" } },
  updateMonsterChest: { policy: VENDOR, own: { vendor: "businessTitle" } },
  updateVendorProfile: { policy: VENDOR, own: { email: "email" } },
  callGroupPurchase: VENDOR, // publishes a News item; carries no owner field

  // Takes only dealId, so ownership has to come from the stored record.
  toggleGuildDealActive: {
    policy: VENDOR,
    resource: {
      model: "GuildDeal",
      idArg: "dealId",
      field: "vendor",
      claim: "businessTitle",
    },
  },

  // --- Either principal --------------------------------------------------
  sendMessage: { policy: AUTHENTICATED, own: { sender: "principalName" } },
  readMessage: { policy: AUTHENTICATED, own: { receiver: "principalName" } },

  // Both sides of an order may change its state. The acting side is pinned to
  // the caller; the counterparty stays a client value. Which of vendor/resident
  // gets pinned depends on the token, so it uses principalName against
  // whichever field matches — see applyPolicy's orderParty handling.
  cancel: { policy: AUTHENTICATED, orderParty: true },
  confirm: { policy: AUTHENTICATED, orderParty: true },
  dispute: { policy: AUTHENTICATED, orderParty: true },

  // Builds a Mongo connection string by interpolating `resident`. The value is
  // now pinned to the caller when a resident calls; vendor-initiated calls
  // still pass a resident name, which is validated in the resolver.
  savePrepaidVendorItem: { policy: AUTHENTICATED, orderParty: true },

  // --- Privileged --------------------------------------------------------
  // Debits the treasury and credits every resident in one call. Gated on
  // CityHall.governor, the schema's existing administrator concept.
  distributeWelfare: {
    policy: RESIDENT,
    role: { kind: "governor", metroArg: "metro" },
  },
};

module.exports = { MUTATION_POLICY };
