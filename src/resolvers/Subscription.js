// subscription resolver functions for profiles

function registerSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("REGISTER_PROFILE");
}

const register = {
  subscribe: registerSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function loginSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("LOGIN");
}

const login = {
  subscribe: loginSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function createProfileSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("CREATE_PROFILE");
}

const createProfile = {
  subscribe: createProfileSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function updateProfileSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("UPDATE_PROFILE");
}

const updateProfile = {
  subscribe: updateProfileSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function deleteProfileSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("DELETE_PROFILE");
}

const deleteProfile = {
  subscribe: deleteProfileSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

// subscription resolver functions for clients
function createClientSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("CREATE_CLIENT");
}

const createClient = {
  subscribe: createClientSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function updateClientSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("UPDATE_CLIENT");
}

const updateClient = {
  subscribe: updateClientSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function deleteClientSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("DELETE_CLIENT");
}

const deleteClient = {
  subscribe: deleteClientSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

// subscription resolver functions for projects
function createProjectSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("CREATE_PROJECT");
}

const createProject = {
  subscribe: createProjectSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function updateProjectSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("UPDATE_PROJECT");
}

const updateProject = {
  subscribe: updateProjectSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function deleteProjectSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("DELETE_PROJECT");
}

const deleteProject = {
  subscribe: deleteProjectSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

// subscription resolver functions for subprojects
function createSubprojectSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("CREATE_SUBPROJECT");
}

const createSubproject = {
  subscribe: createSubprojectSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function updateSubprojectSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("UPDATE_SUBPROJECT");
}

const updateSubproject = {
  subscribe: updateSubprojectSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function deleteSubprojectSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("DELETE_SUBPROJECT");
}

const deleteSubproject = {
  subscribe: deleteSubprojectSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

// subscription resolver functions for journal
function createJournalSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("CREATE_JOURNAL");
}

const createJournal = {
  subscribe: createJournalSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function updateJournalSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("UPDATE_JOURNAL");
}

const updateJournal = {
  subscribe: updateJournalSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

function deleteJournalSubscribe(parent, args, context, info) {
  return context.pubsub.asyncIterator("DELETE_JOURNAL");
}

const deleteJournal = {
  subscribe: deleteJournalSubscribe,
  resolve: (payload) => {
    return payload;
  },
};

module.exports = {
  login,
  register,
  createProfile,
  updateProfile,
  deleteProfile,

  createClient,
  updateClient,
  deleteClient,

  createProject,
  updateProject,
  deleteProject,

  createSubproject,
  updateSubproject,
  deleteSubproject,

  createJournal,
  updateJournal,
  deleteJournal,
};
