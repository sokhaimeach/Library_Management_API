const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const {
  getMemberBorrow,
  getMemberPenalty,
} = require("../controllers/memberHistory.controller");

router.get(
  "/borrow/:id",
  protect,
  verifyRoles("admin", "librarian"),
  getMemberBorrow,
);
router.get(
  "/penalty/:id",
  protect,
  verifyRoles("admin", "librarian"),
  getMemberPenalty,
);

module.exports = router;
