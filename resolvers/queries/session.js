/**
 * Query resolvers — session.
 *
 * Split out of the monolithic resolvers/Query.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/queryPolicy.js.
 */

module.exports = {
  getCurrentResident: async (_, args, { Resident, currentUser}) => {
    // console.log("current user");
    // console.log(currentUser);
    if (currentUser && currentUser.tokenSign === "resident") {
      const resident = await Resident.findOne({
        residentName: currentUser.residentName,
      }).populate([{
        path: "pet",
        model: "Pet",
      }, 
      {path: "guild", model: "Guild"}]
      );
      // console.log(moment(resident.birthday).format("YYYY-MM-DD"))
      // resident.birthday = resident.birthday.getTime()
      // console.log(resident);
      return resident;
    } else {
      return null;
    }
  },

  getCurrentVendor: async (_, args, { Vendor, currentUser }) => {
    // console.log("job is done");
    // console.log(currentResident);
    if (currentUser && currentUser.tokenSign === "vendor") {
      const vendor = await Vendor.findOne({
        businessTitle: currentUser.businessTitle,
      });
      return vendor;
    } else {
      return null;
    }
  },
};
