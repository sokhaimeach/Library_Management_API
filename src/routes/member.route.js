const express = require("express");
const router = express.Router();
const {
  createMember,
  getAllMembers,
  updateMember,
  changeMemberType,
} = require("../controllers/member.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const ROLE = process.env.ROLES.split(",");

router.post("/", protect, verifyRoles(ROLE[0], ROLE[1]), createMember);
router.get("/", protect, verifyRoles(ROLE[0], ROLE[1]), getAllMembers);
router.put("/:id", protect, verifyRoles(ROLE[0], ROLE[1]), updateMember);
router.patch(
  "/:id/type",
  protect,
  verifyRoles(ROLE[0], ROLE[1]),
  changeMemberType,
);

module.exports = router;
