const { checkConnected } = require("../utils");
async function createClient(parent, args, context, info) {
  const { idProfileConnected, foundConnected } = await checkConnected(context);
  const newClientObj = {
    idProfile: idProfileConnected,
    Name: args.client.Name,
    Description: args.client.Description,
    StartDate: args.client.StartDate,
    EndDate: args.client.EndDate,
  };
  const createdClient = await context.prisma.client.create({
    data: { ...newClientObj },
  });

  await context.pubsub.publish("CREATE_CLIENT", createdClient);
  return createdClient;
}

async function updateClient(parent, args, context, info) {
  await checkConnected(context);

  const idClientInt = parseInt(args.idClient);
  const foundClient = await context.prisma.client.findUnique({
    where: {
      idClient: idClientInt,
    },
  });
  if (!foundClient) {
    throw new Error("Client not found");
  }
  const updatedClientObj = {
    idProfile: foundClient.idProfile,
    idClient: idClientInt,
    Name: args.client.Name,
    Description: args.client.Description,
    StartDate: args.client.StartDate,
    EndDate: args.client.EndDate,
  };

  const updatedClient = await context.prisma.client.update({
    where: { idClient: idClientInt },
    data: { ...updatedClientObj },
  });

  await context.pubsub.publish("UPDATE_CLIENT", updatedClient);
  return updatedClient;
}

async function deleteClient(parent, args, context, info) {
  await checkConnected(context);

  const idClientInt = parseInt(args.idClient);
  const foundClient = await context.prisma.client.findUnique({
    where: {
      idClient: idClientInt,
    },
    include: {
      project: true,
      subproject: true,
      journal: true,
    },
  });
  if (!foundClient) {
    throw new Error("Client not found");
  }
  if (
    (foundClient.project && foundClient.project.length > 0) ||
    (foundClient.journal && foundClient.journal.length > 0) ||
    (foundClient.subproject && foundClient.subproject.length > 0)
  ) {
    throw new Error("Cannot delete client, projects, subprojects and/or journal entries exists");
  }

  const deletedClient = await context.prisma.client.delete({
    where: { idClient: idClientInt },
    select: {
      idProfile: true,
      idClient: true,
      Name: true,
      Description: true,
      StartDate: true,
      EndDate: true,
    },
  });

  await context.pubsub.publish("DELETED_CLIENT", deletedClient);
  return deletedClient;
}

module.exports = {
  createClient,
  updateClient,
  deleteClient,
};
