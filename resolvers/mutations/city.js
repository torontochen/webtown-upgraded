/**
 * Mutation resolvers — city.
 *
 * Split out of the monolithic resolvers/Mutation.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/mutationPolicy.js.
 */

module.exports = {
  distributeWelfare: async (_, {welfare, total, metro}, {CityHall, Resident}) => {
    await CityHall.findOneAndUpdate({metro}, { $inc: {treasure: -total}})
    await Resident.updateMany({}, { $inc: {silverCoins: welfare}})
    return { distributed: true}
  },
};
