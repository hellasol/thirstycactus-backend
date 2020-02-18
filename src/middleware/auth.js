const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

module.exports = function(req, res, next) {
  const token = req.headers["x-access-token"] || req.headers["authorization"];
  if (!token) return res.status(401).send("Access denied. no token provided");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("invalid token");
  }
};
