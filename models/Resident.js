const mongoose = require("mongoose");
// const md5 = require("md5")
const bcrypt = require("bcrypt");

const ResidentSchema = new mongoose.Schema({
  // _id: {
  //   type: mongoose.Schema.Types.ObjectId
  // },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  residentName: {
    type: String,
    default: "",
    trim: true,
    index: true,
    unique: true,
  },

  nickName: {
    type: String,
    default: "",
    trim: true
  },
  firstName: {
    type: String,
    trim: true,
    default: "",
  },
  lastName: {
    type: String,
    trim: true,
    default: "",
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  might: {
    type: Number,
    default: 100
  },
  country: {
    type: String,
    default: "Canada",
  },
  mailStrAddress: {
    type: String,
    trim: true,
    default: "",
  },
  mailCity: {
    type: String,
    trim: true,
    default: "",
  },
  mailState: {
    type: String,
    default: "Ontario",
  },
  mailCountry: {
    type: String,
    default: "Canada",
  },
  mailPostalCode: {
    type: String,
    default: "",
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  avatarPic: {
    type: String,
    default:
      "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAMFBMVEX29vKdnZPKysOoqJ/V1c6+vrejo5ng4Nqzs6vw8Ozr6+bExL3a2tSurqW5ubHl5eD0hMvSAAAEKUlEQVR4nO2di5KDIAxFxTe2tf//t1vH3e1DWxVuuCmT8wXcCYEQQigKwzAMwzAMwzAMwzAMwzCe6bqyHPuq6sey7Dr2aMIYyqZyL1RNObDHdYzraSHiX8zpyh7dXobyrYpfLV9hl675rGKm0e4wXb9HxkSvWcqwyxr/VlE7wcr2iA7n2pI94lWGyzEZExeFRqkPmuPXKDV73K+cQmRMnNgjf8If8vJnGs8e/R0f4B53LmqUxOlQpCRiXs00bAUzwX5+R4XHn+N1OHdmq7jtg0H7xyst301GhA7nRrYOyMSaYE+ujTPUfiqujhqlwzlu1AUzCNkkQINwTQI0CNUkHVKHc7xTfHSQ9Qwv5IJs6ndalg7YZvgHa1MEzyze3ALPLNrcAq9ZE5x1q8QL4WTsdqd599NThOB1OMfQcZUQwrgEggaMfzCcBJA8WcJIpwj4Osfb4dvhBGFL9BI6nEufFhLY1yfS7+3w0HcmfQAsEKBMpF9/sxECSpW+kj51KrKNMDaSbIREXre945JciIwOQiBvQkyICTEhJsSEmJCchAjFWhb9mhChE2L6S6tszuzZCBHKa6VP0GWTacwm9yu0tafXIbO1p0+iZHTRI7L+Mu4QRS5DGVV0IusvpYZDQghDh8SyxVi0BMq1WAVb2VQHCRSjkN4j51JBhz8kst5ewJ2E9eQV7iS0J/vQ0nhmcTy4ZIv39g18bie+ToIuwLTS+AIcpTDfh0JDeWoTiFzeWCH3RG4DiAEnhNz+ARZvsd+4wtyd3u8F5O7kF64FLCukoK0IxCR8g4BMosAgEJNoMAjEJCoMAjCJDoMATKLEINEm0WKQaJOoMUikSTiZ63WiTEKPsh6JMIkeD5mIMIkiD7nhg/MpzNzJGsH5FBUdqR4IztWpcvUiojSFPfAFgeuWpk1kJrCig/MU/xOB3q7N14NTdfr6spoQbZgQbZgQbZgQbWQjJDBEUdLq94FsgsbAMF5X6qGIOFjxG/0+E3zUZbfHfSWTBvgRGTplThJR8KRrbkW8wVC1AEeVDSjKbPmoa4VKzwocWX+mJkzJ5Q4xl+tpSO0ZP5r3qC8JyB7f4Tr5M1fhAfpeYWQVAx77R2wPlL/G8DIoUs5CLR9uoVfCIHLzw8M4En2X6GuhthWPjLX0anxuRJrKLmkbwSn24SdQCYR+FxV2jDda0O7ia7FVaose6C7XVI6xTttgphjPGHf66DjfMzxjjaqMmWH+6HemkrTBUlTJmAiUEvabqSwBf6V2Qq3ZYrkcO395kf8GMJwOzC/cAVaC/YdixeaY2XcVEfL1cmr2fPV8VbhYLWk3oxaRjkASbCzEX6NjQ8kX6fio5Kt0fFAi8g+SJG88PrxQn8Wbb4UVHKCOsnqRKtTTU5aVexXMH9KpaZdbvEhOWp7FRSqw50Fa/kzyA728RUu7+v3yAAAAAElFTkSuQmCC",
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pet",
  },
  petLevel: {
    type: String,
    default: 1
  },
  petExperience: {
    type: Number,
    default: 0
  },
  profileFilled: {
    type: Boolean,
    default: false
  },
  currentWish: {
    type: String,
  },
  hobbies: {
    type: [],
  },
  watchList: {
    type: []
  },
  receiveOnlineFlyer: {
    type: Boolean,
    default: true,
  },
  gender: {
    type: String,
    default: "",
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  goldCoins: {
    type: Number,
    default: 0,
  },
  silverCoins: {
    type: Number,
    default: 0,
  },
  silverRecords: {
    type: []
  },
  birthday: {
    type: Date,
  },
  belief: {
    type: String,
  },
  favoriteFood: {
    type: [],
  },
  flyersRead: {
    type: []
  },
  savedFingerPrint: {
    type: String,
    default: "",
  },
  guild: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guild"
  },
  guildOwned: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guild"
  },
  initialLat: {
    type: Number,
  },
  initialLng: {
    type: Number,
  },
  stashedFlyers:{
    type: [],
    default: []
  },
  flyersFedToPet: {
    type: []
  },
  targetFlyers: {
    type: [],
    default: []
  },
  propertyTax: {
    type: Number,
    default: 0.02
  },
  messages: {
    type: [],
    default: []
  },
  guildMessages:{
    type:[],
    default: []
  },
  systemMessages:{
    type: [],
    default: [],
  },
  usedCoupons: {
    type: [],
    default: []
  },
  outsideBoundary: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

// Hash password so it can't be seen
ResidentSchema.pre("save", function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

ResidentSchema.index({ watchList: 'text', hobbies: 'text', currentWish: 'text' })

ResidentSchema.index( { location  : "2dsphere" } )

module.exports = mongoose.model("Resident", ResidentSchema);
