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
const router = express.Router();

// book
router.post("/", createBook);
router.get("/", getAllBooks);
router.put("/:id", updateBook);
router.patch("/:id/recycle", moveBookToRecycleBin);
router.get("/recycle", getAllRemoveBook);
router.delete("/:id", deleteBookPermanently);
// copies
router.patch("/copy/:id", moveCopyToRecycleBin);
router.delete("/copy/:id", deleteCopyPermanently);
router.patch("/copy/:id/allavailable", moveAvailableCopiesByQuantity);
router.delete("/copy/:id/deleteavailable", deleteAllAvailableCopiesPermanently);
router.patch("/copy/restore/:id", restoreFromRecycleBin);

module.exports = router;
