const express = require("express");
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

router.post("/", protect, verifyRoles("admin"), createUser);
router.get("/", protect, verifyRoles("admin"), getUsers);
router.put("/:id", protect, verifyRoles("admin"), updateUser);
router.patch("/:id", protect, verifyRoles("admin"), updateUserStatus);
router.get("/details/:id", protect, getUserDetails);

module.exports = router;
