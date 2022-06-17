const jwt = require("jsonwebtoken");
const APP_SECRET = "GraphQL-is-aw3some";

function getTokenPayload(token) {
  try {
    const payload = jwt.verify(token, APP_SECRET);
    return payload;
  } catch (error) {
    throw new Error("Authentication Invalid");
  }
}

function getIdProfile(req, authToken) {
  if (req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      throw new Error("Authentication Invalid");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new Error("No token found");
    }
    const { idProfile } = getTokenPayload(token);
    return idProfile;
  } else if (authToken) {
    const { idProfile } = getTokenPayload(authToken);
    return idProfile;
  }
  throw new Error("Not authenticated");
}

async function checkConnected(context) {
  const { idProfile } = context;
  if (!idProfile) {
    throw new Error("Not authenticated");
  }
  let idProfileInt;
  try {
    idProfileInt = parseInt(idProfile);
  } catch (error) {
    throw new Error(error);
  }
  const foundConnected = await context.prisma.profile.findUnique({
    where: { idProfile: idProfileInt },
  });
  if (!foundConnected) {
    throw new Error("No such user found");
  }
  const retObj = {
    idProfileConnected: idProfileInt,
    foundConnected,
  };
  return retObj;
}

module.exports = {
  APP_SECRET,
  getIdProfile,
  checkConnected,
};
