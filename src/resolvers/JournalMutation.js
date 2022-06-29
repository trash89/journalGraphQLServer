const { Prisma } = require("@prisma/client");
const { checkConnected } = require("../utils");
async function createJournal(parent, args, context, info) {
  await checkConnected(context);

  const idProfileInt = parseInt(args.journal.idProfile);
  const idClientInt = parseInt(args.journal.idClient);
  const idProjectInt = parseInt(args.journal.idProject);
  const idSubprojectInt = parseInt(args.journal.idSubproject);

  const createdAtToday = new Date().toISOString();
  const newJournalObj = {
    idProfile: idProfileInt,
    idClient: idClientInt,
    idProject: idProjectInt,
    idSubproject: idSubprojectInt,
    createdAt: createdAtToday,
    updatedAt: null,
    EntryDate: args.journal.EntryDate,
    Description: args.journal.Description,
    Todos: args.journal.Todos,
    ThingsDone: args.journal.ThingsDone,
  };
  try {
    const createdJournal = await context.prisma.journal.create({
      data: { ...newJournalObj },
    });
    await context.pubsub.publish("CREATE_JOURNAL", createdJournal);
    return createdJournal;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        throw new Error("There is a unique constraint violation, a journal entry already exists");
      }
    }
    throw new Error(error.message);
  }
}

async function updateJournal(parent, args, context, info) {
  await checkConnected(context);
  const idJournalInt = parseInt(args.idJournal);
  const idProfileInt = parseInt(args.journal.idProfile);
  const idClientInt = parseInt(args.journal.idClient);
  const idProjectInt = parseInt(args.journal.idProject);
  const idSubprojectInt = parseInt(args.journal.idSubproject);
  const foundJournal = await context.prisma.journal.findUnique({
    where: { idJournal: idJournalInt },
  });
  if (!foundJournal) {
    throw new Error("Journal entry not found");
  }
  const updatedAtToday = new Date().toISOString();
  const updatedJournalObj = {
    idProfile: idProfileInt,
    idClient: idClientInt,
    idProject: idProjectInt,
    idSubproject: idSubprojectInt,
    idJournal: idJournalInt,
    createdAt: foundJournal.createdAt,
    updatedAt: updatedAtToday,
    EntryDate: args.journal.EntryDate,
    Description: args.journal.Description,
    Todos: args.journal.Todos,
    ThingsDone: args.journal.ThingsDone,
  };
  try {
    const updatedJournal = await context.prisma.journal.update({
      where: { idJournal: idJournalInt },
      data: { ...updatedJournalObj },
    });

    await context.pubsub.publish("UPDATE_JOURNAL", updatedJournal);
    return updatedJournal;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        throw new Error("There is a unique constraint violation, there is already a journal entry for this date");
      }
    }
    throw new Error(error.message);
  }
}

async function deleteJournal(parent, args, context, info) {
  await checkConnected(context);
  const idJournalInt = parseInt(args.idJournal);
  const foundJournal = await context.prisma.journal.findUnique({
    where: { idJournal: idJournalInt },
  });
  if (!foundJournal) {
    throw new Error("Journal entry not found");
  }

  const deletedJournal = await context.prisma.journal.delete({
    where: { idJournal: idJournalInt },
    select: {
      idProfile: true,
      idClient: true,
      idProject: true,
      idSubproject: true,
      idJournal: true,
      EntryDate: true,
      Description: true,
      Todos: true,
      ThingsDone: true,
    },
  });

  await context.pubsub.publish("DELETE_JOURNAL", deletedJournal);
  return deletedJournal;
}

module.exports = {
  createJournal,
  updateJournal,
  deleteJournal,
};
