const express = require("express");
const http = require("http");
const _ = require("lodash");
const moment = require('moment')
const {
  ApolloServer,
  AuthenticationError,
  PubSub,
} = require("apollo-server-express");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const OpenAI = require ('openai');
// Import Env Variables and Mongoose Modles
require("dotenv").config({
  path: "variables.env",
});


// const _ = require('lodash');
// const { makeExecutableSchema } = require("graphql-tools");
// const cors = require("cors");
// const bodyParser = require("body-parser");
const { LOGO_BASE64 } = require("./src/assets/constDataServer");
// const smtpTransport = require("nodemailer-smtp-transport");
// const GmailTransport = require('gmail-nodemailer-transport');
// const exhbs = require("express-handlebars");

const pubsub = new PubSub();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const app = express();
app.use(
  express.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);
app.use(
  express.json({
    limit: "50mb",
  })
);
// app.use(cors());
const PORT = process.env.PORT || 4000;

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});





// Import typeDefs and resolvers
const filePath = path.join(__dirname, "typeDefs.gql");
const typeDefs = fs.readFileSync(filePath, "utf-8");
const resolvers = require("./resolvers/resolvers");

// Desigante the /dist as static files
// app.use(express.static(__dirname + "/dist/"))

// Specify the folder of index.html
// app.get(/.*/, function (req, res) {
//   res.sendFile(__dirname + "/dist/index.html")
// })

// Import Env Variables and Mongoose Modles
const Resident = require("./models/Resident");
const Vendor = require("./models/Vendor");
const Pet = require("./models/Pet");
const Religion = require("./models/Religion");
const FavoriteFood = require("./models/FavoriteFood");
const Bizcat_Products = require("./models/Bizcat_Products");
const Bizcat_Services = require("./models/Bizcat_Services");
const Bizcat_Restaurants = require("./models/Bizcat_Restaurants");
const ActiveFlyer = require("./models/ActiveFlyer");
const EventCat = require("./models/EventCat");
const RewardItem = require("./models/RewardItem");
const MonsterChest = require("./models/MonsterChest");
const GuildDeal = require('./models/GuildDeal')
const Guild = require('./models/Guild')
const PromotionEvent = require('./models/PromotionEvent')
const CityHall = require('./models/CityHall')
const News = require('./models/News')
const GameProp = require('./models/GameProp')
const GameSubstituteItem = require('./models/GameSubstituteItem')
const GameShopSubstitute = require('./models/GameShopSubstitute')

// Set up handlebars engine
// app.engine("handlebars", exhbs());
// app.set("view engine", "handlebars");
// app.get(/.*/, function (req, res) {
//   res.sendfile(__dirname + "/public/index.html");
// })
// app.set("views", "views");
// app.get("*", (req, res) => {
//   res.redirect("/");
//   // res.setHeader('Content-disposition', "attachment")
// });
// app.use((req, res) => {
//   res.render('index');
// })

// const router = express.Router();
// router.get('/', function (req, res, next) {
//   console.log(req.url);
//   req.url = '/index.html';
//   console.log(req.url);
//   next();
// });
// app.use(router)
// Connect to mongodb databse
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB is Connected"))
  .catch((err) => console.error(err));

exports.defaultConnection = mongoose.connection;

// Verify JWT Token from client side
const getUser = async (token) => {
  // console.log("toke in getUser" + token);
  // await console.log(jwt.vertify(token, process.env.SECRET))

  if (token) {
    const newToken = token.replace("Bearer ", "");
    try {
      // console.log(jwt.verify(token, process.env.SECRET));
      return await jwt.verify(newToken, process.env.SECRET);
    } catch (err) {
      throw new AuthenticationError(
        "Your Token is invalid, Please sign in again"
      );
    }
  }
};
// const getVendor = async token => {
//   console.log("vendortoken" + token)
//   // await console.log(jwt.vertify(token, process.env.SECRET))
//   if (token) {
//     try {
//       return await jwt.verify(token, process.env.SECRET);
//     } catch (err) {
//       throw new AuthenticationError(
//         "Your Token has Expired, Please sign in again"
//       );
//     }
//   }
// };

//Set up Apollo/Grahhql Server using typeDefs, resolvers and context object
const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: {
    maxFieldSize: 10000000000,
    maxFiles: 10,
  },
  formatError: (error) => ({
    name: error.name,
    message: error.message.replace("Context creation failed:", ""),
  }),
  context: async ({ req, connection }) => {
    // console.log("req.headers " + req.headers);
    // console.log("req.body " + req.body);
    // console.log("connection " + connection);
    // console.log("req" + req);
    // console.log('req.headers["authorization"]' + req.headers.authorization);
    const token = connection
      ? connection.context["Authorization"]
      : req.headers.authorization;
    // const token = req.headers['authorization']

    // console.log("toke in server" + token);
    return {
      Resident,
      Vendor,
      Pet,
      Religion,
      FavoriteFood,
      Bizcat_Products,
      Bizcat_Services,
      Bizcat_Restaurants,
      ActiveFlyer,
      EventCat,
      RewardItem,
      MonsterChest,
      GuildDeal,
      Guild,
      PromotionEvent,
      CityHall,
      GameProp,
      GameSubstituteItem,
      GameShopSubstitute,
      News,

      currentUser: await getUser(token),
      transporter,
      pubsub,
      lodash: _,
      moment,
      openai
    };
  },
});

//Set up Cors
//Comment out for production
const whitelist = ["http://localhost:8080", "http://192.168.0.12:4000"];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
// }

//Comment out for production

const corsOptions = {
  credentials: true,
  origin: function(origin, callback) {
    // console.log(origin);
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// const server = createServer(app);
// apolloServer.applyMiddleware({ app });

server.applyMiddleware({
  app,
  cors: corsOptions,
  bodyParserConfig: {
    limit: "100mb",
  },
});

// Email confirmed
app.get("/:emailToken", async (req, res) => {
  // console.dir(req.params.token);

  //

  // await models.User.update({ confirmed: true }, { where: { id } });
  const model = _.split(req.params.emailToken, "-");

  if (model[1] === "Resident") {
    try {
      // const id = jwt.verify(req.params.token, process.env.SECRET);
      // console.log(id.residentName);
      await Resident.findOneAndUpdate(
        {
          email: model[0],
        },
        {
          $set: {
            emailVerified: true,
          },
        },
        {
          new: true,
        }
      );
    } catch (e) {
      return res.render("error", {
        base64: LOGO_BASE64,
      });
    }
    return res.redirect("http://localhost:8080/signin");
    // return res.redirect("https://boundary-faf8da99353c.herokuapp.com/signin");
  } else {
    try {
      // const id = jwt.verify(req.params.token, process.env.SECRET);
      // console.log(id.residentName);
      await Vendor.findOneAndUpdate(
        {
          email: model[0],
        },
        {
          $set: {
            emailVerified: true,
          },
        },
        {
          new: true,
        }
      );
    } catch (e) {
      return res.render("error", {
        base64: LOGO_BASE64,
      });
    }
    return res.redirect("http://localhost:8080/signinvendor");
    // return res.redirect("https://boundary-faf8da99353c.herokuapp.com/signinvendor");
  }
});

//Set up Subscription Handlers
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  // console.log(`Server ready at https://boundary-faf8da99353c.herokuapp.com:${PORT}${server.graphqlPath}`);
  console.log(
    `Subscription ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
  // console.log(
  //   `Subscription ready at wss://boundary-faf8da99353c.herokuapp.com:${PORT}${server.subscriptionsPath}`
  // );
});
