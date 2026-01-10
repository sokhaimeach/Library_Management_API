const express = require("express");
const {
  createPenalty,
  getAllPenalties,
  getPenaltyDetails,
  updatePenaltyStatus,
  deletePenalty,
} = require("../controllers/penalty.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const router = express.Router();

router.post("/", protect, verifyRoles("admin", "librarian"), createPenalty);
router.get("/", protect, verifyRoles("admin", "librarian"), getAllPenalties);
router.get(
  "/:id",
  protect,
  verifyRoles("admin", "librarian"),
  getPenaltyDetails,
);
router.put(
  "/:id",
  protect,
  verifyRoles("admin", "librarian"),
  updatePenaltyStatus,
);
router.delete(
  "/:id",
  protect,
  verifyRoles("admin", "librarian"),
  deletePenalty,
);

module.exports = router;
