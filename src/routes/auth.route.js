const express = require("express");
const router = express.Router();
const ROLES = process.env.ROLES.split(",");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const { login, loginByEmail } = require("../controllers/login.controller");
const {
  changePassword,
  resetPassword,
} = require("../controllers/changePassword.controller");

router.post("/login", login);
router.post("/loginByEmail", loginByEmail);
router.patch("/changePassword", protect, changePassword);
router.patch("/reset/:id", protect, verifyRoles(ROLES[0]), resetPassword);

module.exports = router;
