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

// Body/upload size ceiling. Previously 50 MB on the body parsers and 10 GB on
// the upload field, which made memory exhaustion trivial to trigger.
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES) || 10 * 1024 * 1024;
const BODY_LIMIT = `${Math.ceil(MAX_UPLOAD_BYTES / (1024 * 1024))}mb`;

app.use(
  express.urlencoded({
    limit: BODY_LIMIT,
    parameterLimit: 1000,
    extended: true,
  })
);
app.use(
  express.json({
    limit: BODY_LIMIT,
  })
);
const PORT = process.env.PORT || 4000;
// Where the browser app lives; used for post-email-verification redirects that
// were previously hardcoded to localhost with the prod URL commented beside it.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";

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

// Verify JWT Token from client side.
//
// This is deliberately permissive: a missing, malformed, or expired token
// yields `null` rather than throwing. Enforcement lives in the resolver guards
// (resolvers/auth/), which is where the per-operation policy is.
//
// It used to throw. That made context creation fail for *every* operation when
// a stale token was present — including signinResident/signinVendor — so a user
// holding an expired token could not sign back in. Now that tokens actually
// expire (see createToken* in resolvers/Mutation.js), that path would be hit
// routinely.
const getUser = async (token) => {
  if (!token) return null;

  const newToken = token.replace("Bearer ", "");
  if (!newToken) return null;

  try {
    return await jwt.verify(newToken, process.env.SECRET);
  } catch (err) {
    // Expired or tampered-with. Treat as anonymous; guards will reject any
    // operation that needs a principal.
    return null;
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
  // Was maxFieldSize: 10000000000 (10 GB), which made memory exhaustion a
  // one-request affair. MAX_UPLOAD_BYTES defaults to 10 MB.
  uploads: {
    maxFieldSize: MAX_UPLOAD_BYTES,
    maxFileSize: MAX_UPLOAD_BYTES,
    maxFiles: 10,
  },
  // Apollo wraps resolver errors, so `error.name` is always "GraphQLError" by
  // the time it reaches here — the original class is only recoverable from
  // extensions.code. The client (src/main.js) keys its automatic sign-out off
  // `err.name === "AuthenticationError"`, so without this mapping an expired
  // token would surface as a generic error and the user would sit in a broken
  // signed-in state instead of being returned to the sign-in screen.
  formatError: (error) => {
    const code = error.extensions && error.extensions.code;
    const nameByCode = {
      UNAUTHENTICATED: "AuthenticationError",
      FORBIDDEN: "ForbiddenError",
    };
    return {
      name: nameByCode[code] || error.name,
      code,
      message: error.message.replace("Context creation failed:", ""),
    };
  },
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

// CORS. The whitelist comes from CORS_WHITELIST (comma-separated) so dev and
// prod no longer differ by edited source.
//
// The previous rule also passed when `origin === undefined`, which is every
// non-browser client — curl, scripts, anything without an Origin header. That
// made the whitelist decorative. Requests with no Origin are not subject to the
// same-origin policy in the first place, so allowing them buys nothing; they
// are now rejected in production and permitted only in development, where
// GraphQL Playground and local tooling need them.
const whitelist = (process.env.CORS_WHITELIST || "http://localhost:8080")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin) {
      return isProduction
        ? callback(new Error("Not allowed by CORS"))
        : callback(null, true);
    }
    if (whitelist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
};

server.applyMiddleware({
  app,
  cors: corsOptions,
  bodyParserConfig: {
    limit: BODY_LIMIT,
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
    return res.redirect(`${CLIENT_ORIGIN}/signin`);
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
    return res.redirect(`${CLIENT_ORIGIN}/signinvendor`);
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
