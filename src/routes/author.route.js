const express = require("express");
const {
  getAllAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/author.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const ROLE = process.env.ROLES.split(",");
const router = express.Router();

router.get("/", protect, getAllAuthors);
router.post("/", protect, verifyRoles(ROLE[0], ROLE[2]), createAuthor);
router.put("/:id", protect, verifyRoles(ROLE[0], ROLE[2]), updateAuthor);
router.delete("/:id", protect, verifyRoles(ROLE[0], ROLE[2]), deleteAuthor);

module.exports = router;
