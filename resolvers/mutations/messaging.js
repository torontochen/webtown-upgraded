/**
 * Mutation resolvers — messaging.
 *
 * Split out of the monolithic resolvers/Mutation.js in Phase 3b.
 * Access policy for these lives in resolvers/auth/mutationPolicy.js.
 */

module.exports = {
  sendMessage: async (_, { sender, receiver, receiverType, time, text, fullName, title, guild }, { pubsub, Resident, Vendor}) => {
    if ( receiverType == 'resident' && guild != null) {
      await Resident.findOneAndUpdate({ residentName: receiver}, { $push: { guildMessages: {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false }}})
    } else if (receiverType == 'resident') {
      await Resident.findOneAndUpdate({ residentName: receiver}, { $push: { messages: {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false }}})
    } else {
      await Vendor.findOneAndUpdate({ businessTitle: receiver}, { $push: { messages: {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false  }}})
    }
    
    pubsub.publish('MESSAGE_RECEIVED',{messageReceived: {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false  }} )
    return {sender, receiver, receiverType, time, text, fullName, title, guild, isRead: false  }
  },

  readMessage: async(_, { sender, receiver, guild, time, type}, { Resident, Vendor }) => {
    // console.log(type)
    // console.log(sender)
    // console.log(receiver)
    // console.log(time)
    switch (type) {
      case 'vendor':
      // const newP =  
      await  Resident.findOneAndUpdate({residentName: receiver}, 
        {$set: {"messages.$[el].isRead": true}}, 
       { arrayFilters: [{ "el.sender": sender, "el.time": time}]})
      //  console.log(newP)
       break;
      case 'guild':
        await Resident.findOneAndUpdate({residentName: receiver}, 
          {$set: {"guildMessages.$[el].isRead": true}}, 
        { arrayFilters: [{ "el.guild": guild, "el.time": time}]})
        break;
      case 'resident':
       const record =  await Vendor.findOneAndUpdate({businessTitle: receiver},
          {$set: {"messages.$[el].isRead": true}}, 
        { arrayFilters: [{ "el.sender": sender, "el.time": time}]})
        // console.log(record)
      break;
    }

    return {sender, receiver, guild, time}
  },
};
