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
    cache: "bounded",
    //debug: true,
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
              subscriptionServer.close();
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
  // changed the default path from /graphql to /
  server.applyMiddleware({
    app,
    path: "/",
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}${subscriptionServer.wsServer.options.path}`);
  });
}

if (process.env.NODE_ENV == "production") {
  // interval= 1 day= 24h * 60min * 60sec *1000
  const INTERVAL = 1000 * 60 * 60 * 24;
  setInterval(() => {
    console.log("Launching cleanupDatabase...");
    cleanupDatabase();
    console.log("Finished cleanupDatabase.");
  }, INTERVAL);
}
startApolloServer();

async function cleanupDatabase() {
  //build profile list to be deleted
  const profilesToDelete = await prisma.profile.findMany({
    where: { idProfile: { notIn: [1, 2] } },
  });
  const arrayProfilesToDelete = profilesToDelete.map((profile) => profile.idProfile);
  console.log("Profiles to delete:", arrayProfilesToDelete);

  //build client list to be deleted
  const clientsToDelete = await prisma.client.findMany({
    where: { idProfile: { in: arrayProfilesToDelete } },
  });
  const arrayClientsToDelete = clientsToDelete.map((client) => client.idClient);
  console.log("Clients to delete:", arrayClientsToDelete);

  // delete from journal where idProfile not in (1,2)
  const deleteJournal = prisma.journal.deleteMany({
    where: {
      idProfile: { notIn: [1, 2] },
    },
  });

  // delete from subproject where idClient in  list clients to delete
  const deleteSubproject = prisma.subproject.deleteMany({
    where: { idClient: { in: arrayClientsToDelete } },
  });

  // delete from project where idClient in  list clients to delete
  const deleteProject = prisma.project.deleteMany({
    where: { idClient: { in: arrayClientsToDelete } },
  });

  // delete from client where idProfile  not in [1, 2]
  const deleteClient = prisma.client.deleteMany({
    where: { idProfile: { notIn: [1, 2] } },
  });

  // delete from profile where idProfile  not in [1, 2]
  const deleteProfile = prisma.profile.deleteMany({
    where: {
      idProfile: { notIn: [1, 2] },
    },
  });

  await prisma.$transaction([deleteJournal]);
  await prisma.$transaction([deleteSubproject]);
  await prisma.$transaction([deleteProject]);
  await prisma.$transaction([deleteClient]);
  await prisma.$transaction([deleteProfile]);
}
