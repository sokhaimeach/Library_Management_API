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
const ROLE = process.env.ROLES.split(",");
const router = express.Router();

router.post("/", protect, verifyRoles(ROLE[0], ROLE[1]), createPenalty);
router.get("/", protect, verifyRoles(ROLE[0], ROLE[1]), getAllPenalties);
router.get("/:id", protect, verifyRoles(ROLE[0], ROLE[1]), getPenaltyDetails);
router.put("/:id", protect, verifyRoles(ROLE[0], ROLE[1]), updatePenaltyStatus);
router.delete("/:id", protect, verifyRoles(ROLE[0], ROLE[1]), deletePenalty);

module.exports = router;
