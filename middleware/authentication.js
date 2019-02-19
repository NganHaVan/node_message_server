const jwt = require("jsonwebtoken");
const jwtSecret = require("../config/key").jwtKey;

module.exports = (req, res, next) => {
  if (!req.get("Authorization")) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    // The token contains the email and userId
    decodedToken = jwt.verify(token, jwtSecret);
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};
