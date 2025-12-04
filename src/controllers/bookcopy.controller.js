const BookCopy = require("../models/bookcopy");
const Book = require("../models/book");

// move copy to recycle bin
const moveCopyToRecycleBin = async (req, res) => {
  try {
    const { id } = req.params;
    const copy = await BookCopy.findOneAndUpdate(
      { _id: id, status: "available", deleted: false },
      { deleted: true, deleted_at: Date.now() },
      { new: true },
    );
    if (!copy) {
      return res.status(404).json({ message: "Book status not available" });
    }
    await Book.findByIdAndUpdate(
      copy.book_id,
      { $inc: { total_copies: -1 } },
      { new: true },
    );
    res.status(200).json({ message: "Copy moved to recycle bin successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error move copy to recycle " + error.message });
  }
};

// delete copy permanently
const deleteCopyPermanently = async (req, res) => {
  try {
    const { id } = req.params;
    const copy = await BookCopy.findById(id);
    if (!copy) {
      return res.status(404).json({ message: "Not found" });
    }
    if (copy.status !== "available") {
      return res.status(400).json({ message: "Copy is not available" });
    }
    await BookCopy.findByIdAndDelete(id);
    console.log(copy);
    if (!copy.deleted) {
      await Book.findOneAndUpdate(
        { _id: copy.book_id },
        { $inc: { total_copies: -1 } },
        { new: true },
      );
    }
    res.status(200).json({ message: "Copy deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting copy: " + err.message });
  }
};

// move all available copies to recycle bin
const moveAllAvailableCopiesToRecycleBin = async (req, res) => {
  try {
    const { id } = req.params;
    const copies = await BookCopy.find({ book_id: id, status: "available" });
    if (copies.length === 0) {
      return res.status(404).json({ message: "No available copies found" });
    }
    await BookCopy.updateMany(
      { status: "available" },
      { deleted: true, deleted_at: Date.now() },
    );
    await Book.findByIdAndUpdate(id, {
      $inc: { total_copies: -copies.length },
    });
    res
      .status(200)
      .json({ message: "All available copies moved to recycle bin" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error moving copies to recycle bin " + error.message });
  }
};

// delete all available copies permanently
const deleteAllAvailableCopiesPermanently = async (req, res) => {
  try {
    const { id } = req.params;
    const copies = await BookCopy.find({ book_id: id, status: "available" });
    if (copies.length === 0) {
      return res.status(404).json({ message: "No available copies found" });
    }
    await BookCopy.deleteMany({ book_id: id, status: "available" });
    await Book.findByIdAndUpdate(id, {
      $inc: { total_copies: -copies.length },
    });
    res
      .status(200)
      .json({ message: "All available copies deleted permanently" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting copies permanently " + error.message });
  }
};

module.exports = {
  moveCopyToRecycleBin,
  deleteCopyPermanently,
  moveAllAvailableCopiesToRecycleBin,
  deleteAllAvailableCopiesPermanently,
};
