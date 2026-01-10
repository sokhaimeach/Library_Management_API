const express = require("express");
const router = express.Router();
const {
  createMember,
  getAllMembers,
  updateMember,
  changeMemberType,
  getMemberById,
} = require("../controllers/member.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");

router.post("/", protect, verifyRoles("admin", "librarian"), createMember);
router.get("/", protect, verifyRoles("admin", "librarian"), getAllMembers);
router.put("/:id", protect, verifyRoles("admin", "librarian"), updateMember);
router.patch(
  "/:id/type",
  protect,
  verifyRoles("admin", "librarian"),
  changeMemberType,
);
router.get("/:id", protect, verifyRoles("admin", "librarian"), getMemberById);

module.exports = router;
