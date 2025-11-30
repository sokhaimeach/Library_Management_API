const verifyRoles = (...allowedRols) => {
  return (req, res, next) => {
    if (!req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowedRols.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }
    next();
  };
};

module.exports = { verifyRoles };
