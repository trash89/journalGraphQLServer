const { Prisma } = require("@prisma/client");
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
  try {
    const createdProject = await context.prisma.project.create({
      data: { ...newProjectObj },
    });
    await context.pubsub.publish("CREATE_PROJECT", createdProject);
    return createdProject;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        throw new Error("There is a unique constraint violation, a project with this name already exists for this client");
      }
    }
    throw new Error(error.message);
  }
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
  try {
    const updatedProject = await context.prisma.project.update({
      where: { idProject: idProjectInt },
      data: { ...updatedProjectObj },
    });
    await context.pubsub.publish("UPDATE_PROJECT", updatedProject);
    return updatedProject;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === "P2002") {
        throw new Error("There is a unique constraint violation, there is already a project with this name for this client");
      }
    }
    throw new Error(error.message);
  }
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
