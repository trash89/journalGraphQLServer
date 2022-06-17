const { checkConnected } = require("../utils");

// list of fields included in relation queries
const profileIncludes = {
  select: {
    idProfile: true,
    Username: true,
    Password: false,
    Is_Admin: true,
  },
};

const clientIncludes = {
  select: {
    idProfile: true,
    idClient: true,
    Name: true,
    Description: true,
    StartDate: true,
    EndDate: true,
  },
};

const projectIncludes = {
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
};
const subprojectIncludes = {
  select: {
    idProject: true,
    idClient: true,
    idSubproject: true,
    Name: true,
    Description: true,
    isDefault: true,
    StartDate: true,
    EndDate: true,
    Finished: true,
  },
};

const journalIncludes = {
  select: {
    idProfile: true,
    idClient: true,
    idProject: true,
    idSubproject: true,
    idJournal: true,
    createdAt: true,
    updatedAt: true,
    EntryDate: true,
    Description: true,
    Todos: true,
    ThingsDone: true,
    DocUploaded: true,
  },
};

async function profile(parent, args, context) {
  await checkConnected(context);
  return await context.prisma.profile.findUnique({
    where: {
      idProfile: parseInt(args.idProfile),
    },
    include: {
      client: clientIncludes,
      journal: journalIncludes,
    },
  });
}

async function client(parent, args, context) {
  await checkConnected(context);
  return await context.prisma.client.findUnique({
    where: {
      idClient: parseInt(args.idClient),
    },
    include: {
      profile: profileIncludes,
      project: projectIncludes,
      subproject: subprojectIncludes,
      journal: journalIncludes,
    },
  });
}

async function project(parent, args, context) {
  await checkConnected(context);
  return await context.prisma.project.findUnique({
    where: {
      idProject: parseInt(args.idProject),
    },
    include: {
      client: clientIncludes,
      subproject: subprojectIncludes,
      journal: journalIncludes,
    },
  });
}

async function subproject(parent, args, context) {
  await checkConnected(context);
  return await context.prisma.subproject.findUnique({
    where: {
      idSubproject: parseInt(args.idSubproject),
    },
    include: {
      client: clientIncludes,
      project: projectIncludes,
      journal: journalIncludes,
    },
  });
}

async function journal(parent, args, context) {
  await checkConnected(context);
  return await context.prisma.journal.findUnique({
    where: {
      idJournal: parseInt(args.idJournal),
    },
    include: {
      profile: profileIncludes,
      client: clientIncludes,
      project: projectIncludes,
      subproject: subprojectIncludes,
    },
  });
}

async function profiles(parent, args, context) {
  const { idProfileConnected, foundConnected } = await checkConnected(context);
  let where;
  // if admin ,can see all, otherwise, only his profile is returned
  if (foundConnected.Is_Admin === "Y") {
    where = args.filter
      ? {
          Username: { contains: args.filter },
        }
      : {};
  } else {
    where = args.filter
      ? {
          Username: { contains: args.filter },
          idProfile: idProfileConnected,
        }
      : {
          idProfile: idProfileConnected,
        };
  }
  const count = await context.prisma.profile.count({ where });
  const list = await context.prisma.profile.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
    include: {
      client: clientIncludes,
      journal: journalIncludes,
    },
  });
  return { list, count };
}

async function clients(parent, args, context) {
  const { idProfileConnected, foundConnected } = await checkConnected(context);
  let where;
  // if admin ,can see all clients, otherwise, only the clients his profile created
  if (foundConnected.Is_Admin === "Y") {
    where = args.filter
      ? {
          OR: [{ Name: { contains: args.filter } }, { Description: { contains: args.filter } }],
        }
      : {};
  } else {
    where = args.filter
      ? {
          idProfile: idProfileConnected,
          OR: [{ Name: { contains: args.filter } }, { Description: { contains: args.filter } }],
        }
      : {
          idProfile: idProfileConnected,
        };
  }
  const count = await context.prisma.client.count({ where });
  const list = await context.prisma.client.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
    include: {
      profile: profileIncludes,
      project: projectIncludes,
      subproject: subprojectIncludes,
      journal: journalIncludes,
    },
  });
  return { list, count };
}

async function projects(parent, args, context) {
  const { idProfileConnected, foundConnected } = await checkConnected(context);
  let where;
  // if admin, can see all projects
  if (foundConnected.Is_Admin === "Y") {
    where = args.filter
      ? {
          OR: [{ Name: { contains: args.filter } }, { Description: { contains: args.filter } }],
        }
      : {};
  } else {
    // otherwise, only the projects belonging to his clients are returned
    const listClients = await context.prisma.client.findMany({
      where: { idProfile: idProfileConnected },
      select: {
        idClient: true,
      },
    });
    const listClientsArray = listClients.map((client) => client.idClient);
    where = args.filter
      ? {
          idClient: { in: listClientsArray },
          OR: [{ Name: { contains: args.filter } }, { Description: { contains: args.filter } }],
        }
      : {
          idClient: { in: listClientsArray },
        };
  }
  const count = await context.prisma.project.count({ where });
  const list = await context.prisma.project.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
    include: {
      client: clientIncludes,
      subproject: subprojectIncludes,
      journal: journalIncludes,
    },
  });
  return { list, count };
}

async function subprojects(parent, args, context) {
  const { idProfileConnected, foundConnected } = await checkConnected(context);
  let where;
  // if admin, can see all subprojects
  if (foundConnected.Is_Admin === "Y") {
    where = args.filter
      ? {
          OR: [{ Name: { contains: args.filter } }, { Description: { contains: args.filter } }],
        }
      : {};
  } else {
    // only the subprojects of the projects belonging to his clients

    const listClients = await context.prisma.client.findMany({
      where: { idProfile: idProfileConnected },
      select: {
        idClient: true,
      },
    });
    const listClientsArray = listClients.map((client) => client.idClient);

    where = args.filter
      ? {
          idClient: { in: listClientsArray },
          OR: [{ Name: { contains: args.filter } }, { Description: { contains: args.filter } }],
        }
      : {
          idClient: { in: listClientsArray },
        };
  }

  const count = await context.prisma.subproject.count({ where });
  const list = await context.prisma.subproject.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
    include: {
      client: clientIncludes,
      project: projectIncludes,
      journal: journalIncludes,
    },
  });
  return { list, count };
}

async function journals(parent, args, context) {
  const { idProfileConnected, foundConnected } = await checkConnected(context);
  let where;
  if (foundConnected.Is_Admin === "Y") {
    where = args.filter
      ? {
          OR: [{ Description: { contains: args.filter } }, { Todos: { contains: args.filter } }, { ThingsDone: { contains: args.filter } }],
        }
      : {};
  } else {
    where = args.filter
      ? {
          idProfile: idProfileConnected,
          OR: [{ Description: { contains: args.filter } }, { Todos: { contains: args.filter } }, { ThingsDone: { contains: args.filter } }],
        }
      : {
          idProfile: idProfileConnected,
        };
  }
  const count = await context.prisma.journal.count({ where });
  const list = await context.prisma.journal.findMany({
    where,
    skip: args.skip,
    take: args.take,
    orderBy: args.orderBy,
    include: {
      profile: profileIncludes,
      client: clientIncludes,
      project: projectIncludes,
      subproject: subprojectIncludes,
    },
  });
  return { list, count };
}

module.exports = {
  profile,
  client,
  project,
  subproject,
  journal,

  profiles,
  clients,
  projects,
  subprojects,
  journals,
};
