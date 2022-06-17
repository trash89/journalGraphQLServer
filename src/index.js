const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");

const { createServer } = require("http");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { PubSub } = require("graphql-subscriptions");

const { makeExecutableSchema } = require("@graphql-tools/schema");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { execute, subscribe } = require("graphql");

const { getIdProfile } = require("./utils");

const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const Subscription = require("./resolvers/Subscription");

//const prisma = new PrismaClient({ log: ["query", "info"] });
const prisma = new PrismaClient();
const pubsub = new PubSub();

const PORT = process.env.PORT || 4000;
const typeDefs = fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8");
const resolvers = {
  Query,
  Mutation,
  Subscription,
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

async function startApolloServer() {
  const app = express();
  app.use(cors());
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }
  app.use(express.json());

  //app.use(express.static(path.resolve(__dirname, "./client/build")));
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(xss());
  // app.get("*", (req, res) => {
  //   res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
  // });

  const httpServer = createServer(app);

  const server = new ApolloServer({
    schema: schema,
    csrfPrevention: true,
    introspection: true,
    context: ({ req }) => {
      return {
        ...req,
        prisma,
        pubsub,
        idProfile: req && req.headers.authorization ? getIdProfile(req) : null,
      };
    },
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await subscriptionServer.close();
            },
          };
        },
      },
    ],
  });
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      async onConnect(connectionParams, webSocket, context) {
        if (connectionParams.authToken) {
          return {
            context,
            pubsub,
            idProfile: getIdProfile(null, connectionParams.authToken),
          };
        } else {
          return {
            context,
            pubsub,
          };
        }
      },
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    }
  );
  await server.start();
  server.applyMiddleware({
    app,
    path: "/",
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}${subscriptionServer.wsServer.options.path}`);
  });
}

startApolloServer();
