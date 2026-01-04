const express = require("express");
const router = express.Router();
const {
  getKpis,
  getOverdueBorrows,
  getAvailableVsBorrowed,
  getBorrowTrend,
  getStatusBreakdown,
  getTopCategories,
  getRecentBorrows,
  getRecentPenalties,
} = require("../controllers/report.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/kpi", protect, getKpis);
router.get("/overdue", protect, getOverdueBorrows);
router.get("/available-vs-borrowed", protect, getAvailableVsBorrowed);
router.get("/borrow-trend", protect, getBorrowTrend);
router.get("/status-breakdown", protect, getStatusBreakdown);
router.get("/top-categories", protect, getTopCategories);
router.get("/recent-borrows", protect, getRecentBorrows);
router.get("/recent-penalties", protect, getRecentPenalties);

module.exports = router;
