// protect user authorization
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        // bearer token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
      } catch (err) {
        res.status(401).json({ message: "Unauthorized" });
      }
    }
    if (!token) {
      res.status(401).json({ message: "No token provided" });
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { protect };
