const express = require("express");
const ROLES = process.env.ROLES.split(",");
const {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const { login } = require("../controllers/login.controller");
const router = express.Router();

router.post("/", protect, verifyRoles(ROLES[0]), createUser);
router.get("/", protect, verifyRoles(ROLES[0]), getUsers);
router.put("/:id", protect, verifyRoles(ROLES[0]), updateUser);
router.patch("/:id", protect, verifyRoles(ROLES[0]), updateUserStatus);
router.post("/login", login);

module.exports = router;
