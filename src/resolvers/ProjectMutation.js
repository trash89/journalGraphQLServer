const { checkConnected } = require("../utils");
async function createProject(parent, args, context, info) {
  await checkConnected(context);
  const idClientInt = parseInt(args.project.idClient);
  const newProjectObj = {
    idClient: idClientInt,
    Name: args.project.Name,
    Description: args.project.Description,
    isDefault: args.project.isDefault,
    StartDate: args.project.StartDate,
    EndDate: args.project.EndDate,
    Finished: args.project.Finished,
  };
  const createdProject = await context.prisma.project.create({
    data: { ...newProjectObj },
  });
  await context.pubsub.publish("CREATE_PROJECT", createdProject);
  return createdProject;
}

async function updateProject(parent, args, context, info) {
  await checkConnected(context);
  const idProjectInt = parseInt(args.idProject);
  const foundProject = await context.prisma.project.findUnique({
    where: { idProject: idProjectInt },
  });
  if (!foundProject) {
    throw new Error("Project not found");
  }
  const idClientInt = parseInt(args.project.idClient);
  const updatedProjectObj = {
    idClient: idClientInt,
    idProject: idProjectInt,
    Name: args.project.Name,
    Description: args.project.Description,
    isDefault: args.project.isDefault,
    StartDate: args.project.StartDate,
    EndDate: args.project.EndDate,
    Finished: args.project.Finished,
  };

  const updatedProject = await context.prisma.project.update({
    where: { idProject: idProjectInt },
    data: { ...updatedProjectObj },
  });
  await context.pubsub.publish("UPDATE_PROJECT", updatedProject);
  return updatedProject;
}

async function deleteProject(parent, args, context, info) {
  await checkConnected(context);
  const idProjectInt = parseInt(args.idProject);
  const foundProject = await context.prisma.project.findUnique({
    where: { idProject: idProjectInt },
    include: {
      subproject: true,
      journal: true,
    },
  });
  if (!foundProject) {
    throw new Error("Project not found");
  }
  if ((foundProject.journal && foundProject.journal.length > 0) || (foundProject.subproject && foundProject.subproject.length > 0)) {
    throw new Error("Cannot delete project, subprojects and/or journal entries exists");
  }

  const deletedProject = await context.prisma.project.delete({
    where: { idProject: idProjectInt },
    select: {
      idClient: true,
      idProject: true,
      Name: true,
      Description: true,
      isDefault: true,
      StartDate: true,
      EndDate: true,
      Finished: true,
    },
  });

  await context.pubsub.publish("DELETE_PROJECT", deletedProject);
  return deletedProject;
}

module.exports = {
  createProject,
  updateProject,
  deleteProject,
};
