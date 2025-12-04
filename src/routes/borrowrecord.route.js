const express = require("express");
const {
  getAllRecord,
  createRecord,
  getRecordDetails,
  updateRecordStatus,
} = require("../controllers/borrowrecord.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const ROLE = process.env.ROLES.split(",");
const router = express.Router();

router.get("/", protect, verifyRoles(ROLE[0], ROLE[1]), getAllRecord);
router.post("/", protect, verifyRoles(ROLE[0], ROLE[1]), createRecord);
router.get(
  "/:id/detail",
  protect,
  verifyRoles(ROLE[0], ROLE[1]),
  getRecordDetails,
);
router.put("/:id", protect, verifyRoles(ROLE[0], ROLE[1]), updateRecordStatus);

module.exports = router;
