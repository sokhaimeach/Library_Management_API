const express = require("express");
const {
  getAllAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/author.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const router = express.Router();

router.get("/", protect, getAllAuthors);
router.post("/", protect, verifyRoles("admin", "stock-keeper"), createAuthor);
router.put("/:id", protect, verifyRoles("admin", "stock-keeper"), updateAuthor);
router.delete(
  "/:id",
  protect,
  verifyRoles("admin", "stock-keeper"),
  deleteAuthor,
);

module.exports = router;
