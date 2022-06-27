const {
  login,
  register,
  //createProfile,
  updateProfile,
  deleteProfile,
} = require("./ProfileMutations");
const { createClient, updateClient, deleteClient } = require("./ClientMutation");
const { createProject, updateProject, deleteProject } = require("./ProjectMutation");
const { createSubproject, updateSubproject, deleteSubproject } = require("./SubprojectMutation");
const { createJournal, updateJournal, deleteJournal } = require("./JournalMutation");

module.exports = {
  login,
  register,
  //createProfile,
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
