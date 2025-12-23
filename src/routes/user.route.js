const express = require("express");
const ROLES = process.env.ROLES.split(",");
const {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
  getUserDetails,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const router = express.Router();

router.post("/", protect, verifyRoles(ROLES[0]), createUser);
router.get("/", protect, verifyRoles(ROLES[0]), getUsers);
router.put("/:id", protect, verifyRoles(ROLES[0]), updateUser);
router.patch("/:id", protect, verifyRoles(ROLES[0]), updateUserStatus);
router.get("/details/:id", protect, getUserDetails);

module.exports = router;
