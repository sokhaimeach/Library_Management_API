const express = require("express");
const {
  createPenalty,
  getAllPenalties,
  getPenaltyDetails,
  updatePenaltyStatus,
  deletePenalty,
} = require("../controllers/penalty.controller");
const router = express.Router();

router.post("/", createPenalty);
router.get("/", getAllPenalties);
router.get("/:id", getPenaltyDetails);
router.put("/:id", updatePenaltyStatus);
router.delete("/:id", deletePenalty);

module.exports = router;
