const express = require("express");
const {
  getAllRecord,
  createRecord,
  getRecordDetails,
  updateRecordStatus,
} = require("../controllers/borrowrecord.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const router = express.Router();

router.get("/", protect, verifyRoles("admin", "librarian"), getAllRecord);
router.post("/", protect, verifyRoles("admin", "librarian"), createRecord);
router.get(
  "/:id/detail",
  protect,
  verifyRoles("admin", "librarian"),
  getRecordDetails,
);
router.put(
  "/:id",
  protect,
  verifyRoles("admin", "librarian"),
  updateRecordStatus,
);

module.exports = router;
