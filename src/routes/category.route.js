const express = require("express");
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const router = express.Router();

router.get("/", protect, getAllCategories);
router.post("/", protect, verifyRoles("admin", "stock-keeper"), createCategory);
router.put(
  "/:id",
  protect,
  verifyRoles("admin", "stock-keeper"),
  updateCategory,
);
router.delete(
  "/:id",
  protect,
  verifyRoles("admin", "stock-keeper"),
  deleteCategory,
);

module.exports = router;
