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
const router = express.Router();

// book
router.post("/", protect, verifyRoles("admin", "stock-keeper"), createBook);
router.get("/", protect, getAllBooks);
router.put("/:id", protect, verifyRoles("admin", "stock-keeper"), updateBook);
router.patch(
  "/:id/recycle",
  protect,
  verifyRoles("admin", "stock-keeper"),
  moveBookToRecycleBin,
);
router.get(
  "/recycle",
  protect,
  verifyRoles("admin", "stock-keeper"),
  getAllRemoveBook,
);
router.delete(
  "/:id",
  protect,
  verifyRoles("admin", "stock-keeper"),
  deleteBookPermanently,
);
// copies
router.patch(
  "/copy/:id",
  protect,
  verifyRoles("admin", "stock-keeper"),
  moveCopyToRecycleBin,
);
router.delete(
  "/copy/:id",
  protect,
  verifyRoles("admin", "stock-keeper"),
  deleteCopyPermanently,
);
router.patch(
  "/copy/:id/allavailable",
  protect,
  verifyRoles("admin", "stock-keeper"),
  moveAvailableCopiesByQuantity,
);
router.delete(
  "/copy/:id/deleteavailable",
  protect,
  verifyRoles("admin", "stock-keeper"),
  deleteAllAvailableCopiesPermanently,
);
router.patch(
  "/copy/restore/:id",
  protect,
  verifyRoles("admin", "stock-keeper"),
  restoreFromRecycleBin,
);

module.exports = router;
