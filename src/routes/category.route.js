const express = require("express");
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const ROLE = process.env.ROLES.split(",");
const router = express.Router();

router.get("/", protect, getAllCategories);
router.post("/", protect, verifyRoles(ROLE[0], ROLE[2]), createCategory);
router.put("/:id", protect, verifyRoles(ROLE[0], ROLE[2]), updateCategory);
router.delete("/:id", protect, verifyRoles(ROLE[0], ROLE[2]), deleteCategory);

module.exports = router;
