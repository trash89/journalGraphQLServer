const { checkConnected } = require("../utils");
async function createSubproject(parent, args, context, info) {
  await checkConnected(context);
  const idClientInt = parseInt(args.subproject.idClient);
  const idProjectInt = parseInt(args.subproject.idProject);
  const newSubprojectObj = {
    idClient: idClientInt,
    idProject: idProjectInt,
    Name: args.subproject.Name,
    Description: args.subproject.Description,
    isDefault: args.subproject.isDefault,
    StartDate: args.subproject.StartDate,
    EndDate: args.subproject.EndDate,
    Finished: args.subproject.Finished,
  };
  const createdSubproject = await context.prisma.subproject.create({
    data: { ...newSubprojectObj },
  });

  await context.pubsub.publish("CREATE_SUBPROJECT", createdSubproject);
  return createdSubproject;
}

async function updateSubproject(parent, args, context, info) {
  await checkConnected(context);
  const idSubprojectInt = parseInt(args.idSubproject);
  const idProjectInt = parseInt(args.subproject.idProject);
  const idClientInt = parseInt(args.subproject.idClient);
  const foundSubproject = await context.prisma.subproject.findUnique({
    where: { idSubproject: idSubprojectInt },
  });
  if (!foundSubproject) {
    throw new Error("Subproject not found");
  }
  const updatedSubprojectObj = {
    idProject: idProjectInt,
    idClient: idClientInt,
    idSubproject: idSubprojectInt,
    Name: args.subproject.Name,
    Description: args.subproject.Description,
    isDefault: args.subproject.isDefault,
    StartDate: args.subproject.StartDate,
    EndDate: args.subproject.EndDate,
    Finished: args.subproject.Finished,
  };

  const updatedSubproject = await context.prisma.subproject.update({
    where: { idSubproject: idSubprojectInt },
    data: { ...updatedSubprojectObj },
  });
  await context.pubsub.publish("UPDATE_SUBPROJECT", updatedSubproject);
  return updatedSubproject;
}

async function deleteSubproject(parent, args, context, info) {
  await checkConnected(context);
  const idSubprojectInt = parseInt(args.idSubproject);
  const foundSubproject = await context.prisma.subproject.findUnique({
    where: { idSubproject: idSubprojectInt },
    include: {
      journal: true,
    },
  });
  if (!foundSubproject) {
    throw new Error("Subproject not found");
  }
  if (foundSubproject.journal && foundSubproject.journal.length > 0) {
    throw new Error("Cannot delete subproject, journal entries exists");
  }

  const deletedSubproject = await context.prisma.subproject.delete({
    where: { idSubproject: idSubprojectInt },
    select: {
      idClient: true,
      idProject: true,
      idSubproject: true,
      Name: true,
      Description: true,
      isDefault: true,
      StartDate: true,
      EndDate: true,
      Finished: true,
    },
  });
  await context.pubsub.publish("DELETE_SUBPROJECT", deletedSubproject);
  return deletedSubproject;
}

module.exports = {
  createSubproject,
  updateSubproject,
  deleteSubproject,
};
