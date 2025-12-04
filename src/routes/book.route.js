const express = require("express");
const {
  createBook,
  updateBook,
  getAllBooks,
  moveBookToRecycleBin,
  deleteBookPermanently,
} = require("../controllers/book.controller");
const {
  moveCopyToRecycleBin,
  deleteCopyPermanently,
  moveAllAvailableCopiesToRecycleBin,
  deleteAllAvailableCopiesPermanently,
} = require("../controllers/bookcopy.controller");
const router = express.Router();

// book
router.post("/", createBook);
router.get("/", getAllBooks);
router.put("/:id", updateBook);
router.patch("/:id/recycle", moveBookToRecycleBin);
router.delete("/:id", deleteBookPermanently);
// copies
router.patch("/copy/:id", moveCopyToRecycleBin);
router.delete("/copy/:id", deleteCopyPermanently);
router.patch("/copy/:id/allavailable", moveAllAvailableCopiesToRecycleBin);
router.delete("/copy/:id/deleteavailable", deleteAllAvailableCopiesPermanently);

module.exports = router;
