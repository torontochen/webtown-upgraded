const express = require("express");
const http = require("http");
const cors = require("cors");
const _ = require("lodash");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const OpenAI = require("openai");

// Apollo Server 4. The v2 `apollo-server-express` package is end-of-life; its
// ApolloServer applied itself to Express and installed its own subscription
// handlers. In v4 those are separate concerns:
//   - HTTP     -> expressMiddleware, mounted by us
//   - WS       -> graphql-ws + the `ws` server, wired by us
//   - PubSub   -> moved out of Apollo into `graphql-subscriptions`
//   - Errors   -> GraphQLError + extensions.code (see resolvers/errors.js)
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { PubSub } = require("graphql-subscriptions");

require("dotenv").config({ path: "variables.env" });

const { LOGO_BASE64 } = require("./src/assets/constDataServer");

const pubsub = new PubSub();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();

// Body size ceiling. Previously 50 MB on the body parsers and 10 GB on the
// upload field, which made memory exhaustion trivial to trigger.
const MAX_UPLOAD_BYTES =
  Number(process.env.MAX_UPLOAD_BYTES) || 10 * 1024 * 1024;
const BODY_LIMIT = `${Math.ceil(MAX_UPLOAD_BYTES / (1024 * 1024))}mb`;

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

// Mongoose models
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
const GuildDeal = require("./models/GuildDeal");
const Guild = require("./models/Guild");
const PromotionEvent = require("./models/PromotionEvent");
const CityHall = require("./models/CityHall");
const News = require("./models/News");
const GameProp = require("./models/GameProp");
const GameSubstituteItem = require("./models/GameSubstituteItem");
const GameShopSubstitute = require("./models/GameShopSubstitute");

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
// Deliberately permissive: a missing, malformed, or expired token yields `null`
// rather than throwing. Enforcement lives in the resolver guards
// (resolvers/auth/), which is where the per-operation policy is.
//
// It used to throw. That made context creation fail for *every* operation when
// a stale token was present — including signinResident/signinVendor — so a user
// holding an expired token could not sign back in.
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

// Everything the resolvers read off the context. Shared by the HTTP and
// WebSocket paths so a subscription resolver sees exactly what a query does.
const buildContext = async (token) => ({
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
  openai,
});

// CORS. The whitelist comes from CORS_WHITELIST (comma-separated) so dev and
// prod no longer differ by edited source.
//
// The previous rule also passed when `origin === undefined`, which is every
// non-browser client. Requests with no Origin are not subject to the
// same-origin policy in the first place, so allowing them buys nothing; they
// are now rejected in production and permitted only in development, where
// local tooling needs them.
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
    if (whitelist.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
};

// Apollo 4 wants an executable schema up front so the same one can serve both
// the HTTP and WebSocket transports.
const schema = makeExecutableSchema({ typeDefs, resolvers });

const httpServer = http.createServer(app);

// Subscriptions over the graphql-ws protocol. Apollo 2's
// `installSubscriptionHandlers` spoke the legacy subscriptions-transport-ws
// protocol, which is unmaintained; graphql-ws is its successor and is what
// src/main.js now speaks.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const wsCleanup = useServer(
  {
    schema,
    // graphql-ws passes connectionParams from the client's connectionParams
    // callback. The client sends { Authorization: "Bearer <token>" }.
    context: async (ctx) => {
      const params = ctx.connectionParams || {};
      const token = params.Authorization || params.authorization;
      return buildContext(token);
    },
  },
  wsServer
);

const server = new ApolloServer({
  schema,

  // Apollo wraps resolver errors, so `error.name` is always "GraphQLError" by
  // the time it reaches here — the original class is only recoverable from
  // extensions.code. The client (src/main.js) keys its automatic sign-out off
  // `err.name === "AuthenticationError"`, so without this mapping an expired
  // token would surface as a generic error and the user would sit in a broken
  // signed-in state instead of being returned to the sign-in screen.
  formatError: (formatted) => {
    const code = formatted.extensions && formatted.extensions.code;
    const nameByCode = {
      UNAUTHENTICATED: "AuthenticationError",
      FORBIDDEN: "ForbiddenError",
      BAD_USER_INPUT: "UserInputError",
    };
    return {
      name: nameByCode[code] || "GraphQLError",
      code,
      message: (formatted.message || "").replace("Context creation failed:", ""),
    };
  },

  plugins: [
    // Close HTTP connections cleanly, then tear the WS server down with them.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await wsCleanup.dispose();
          },
        };
      },
    },
  ],
});

(async () => {
  // Apollo 4 requires an explicit start() before the middleware is mounted.
  await server.start();

  app.use(
    "/graphql",
    cors(corsOptions),
    express.json({ limit: BODY_LIMIT }),
    expressMiddleware(server, {
      context: async ({ req }) => buildContext(req.headers.authorization),
    })
  );

  // Non-GraphQL routes. Registered after the GraphQL mount so the catch-all
  // email-verification route cannot shadow /graphql.
  app.use(
    express.urlencoded({
      limit: BODY_LIMIT,
      parameterLimit: 1000,
      extended: true,
    })
  );

  // Email confirmed
  app.get("/:emailToken", async (req, res) => {
    const model = _.split(req.params.emailToken, "-");

    if (model[1] === "Resident") {
      try {
        await Resident.findOneAndUpdate(
          { email: model[0] },
          { $set: { emailVerified: true } },
          { new: true }
        );
      } catch (e) {
        return res.render("error", { base64: LOGO_BASE64 });
      }
      return res.redirect(`${CLIENT_ORIGIN}/signin`);
    } else {
      try {
        await Vendor.findOneAndUpdate(
          { email: model[0] },
          { $set: { emailVerified: true } },
          { new: true }
        );
      } catch (e) {
        return res.render("error", { base64: LOGO_BASE64 });
      }
      return res.redirect(`${CLIENT_ORIGIN}/signinvendor`);
    }
  });

  httpServer.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}/graphql`);
    console.log(`Subscription ready at ws://localhost:${PORT}/graphql`);
  });
})();
