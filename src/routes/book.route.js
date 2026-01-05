const express = require("express");
const {
  createBook,
  updateBook,
  getAllBooks,
  moveBookToRecycleBin,
  deleteBookPermanently,
  getAllRemoveBook,
} = require("../controllers/book.controller");
const {
  moveCopyToRecycleBin,
  deleteCopyPermanently,
  deleteAllAvailableCopiesPermanently,
  restoreFromRecycleBin,
  moveAvailableCopiesByQuantity,
} = require("../controllers/bookcopy.controller");
const { protect } = require("../middleware/auth.middleware");
const { verifyRoles } = require("../middleware/role.middleware");
const ROLE = process.env.ROLES.split(",");
const router = express.Router();

// book
router.post("/", protect, verifyRoles(ROLE[0], ROLE[2]), createBook);
router.get("/", protect, getAllBooks);
router.put("/:id", protect, verifyRoles(ROLE[0], ROLE[2]), updateBook);
router.patch(
  "/:id/recycle",
  protect,
  verifyRoles(ROLE[0], ROLE[2]),
  moveBookToRecycleBin,
);
router.get(
  "/recycle",
  protect,
  verifyRoles(ROLE[0], ROLE[2]),
  getAllRemoveBook,
);
router.delete(
  "/:id",
  protect,
  verifyRoles(ROLE[0], ROLE[2]),
  deleteBookPermanently,
);
// copies
router.patch(
  "/copy/:id",
  protect,
  verifyRoles(ROLE[0], ROLE[2]),
  moveCopyToRecycleBin,
);
router.delete(
  "/copy/:id",
  protect,
  verifyRoles(ROLE[0], ROLE[2]),
  deleteCopyPermanently,
);
router.patch(
  "/copy/:id/allavailable",
  protect,
  verifyRoles(ROLE[0], ROLE[2]),
  moveAvailableCopiesByQuantity,
);
router.delete(
  "/copy/:id/deleteavailable",
  protect,
  verifyRoles(ROLE[0], ROLE[2]),
  deleteAllAvailableCopiesPermanently,
);
router.patch(
  "/copy/restore/:id",
  protect,
  verifyRoles(ROLE[0], ROLE[2]),
  restoreFromRecycleBin,
);

module.exports = router;
