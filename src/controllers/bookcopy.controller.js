const BookCopy = require("../models/bookcopy");
const Book = require("../models/book");

// add more copy
const addBookCopy = async (req, res) => {
  try {
    const { book_id } = req.params;
    const { quantity } = req.body;
    if(quantity <= 0) {
      return res.status(400).json({message: `Quantity to add must be greater then 0`});
    }
    const book = await Book.findById(book_id);
    if(!book) {
      return res.status(404).json({message: `Book with id=${book_id} not found`});
    }
    await Book.findByIdAndUpdate(book_id, {total_copies: book.total_copies+quantity});
    
    let copies = [];
    for (let i = 0; i < quantity; i++) {
      copies.push({ book_id: book_id });
    }
    await BookCopy.create(copies);
    return res.status(200).json({message: `You added ${quantity} ${quantity>1?"copies":"copy"} to ${book.title}`});
  } catch(error) {
    res
      .status(400)
      .json({ message: "Error more add copy" + error.message });
  }
}

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
const moveAvailableCopiesByQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    // 1. Find limited available copies
    const copies = await BookCopy.find({
      book_id: id,
      status: "available",
      deleted: false,
    })
      .limit(qty)
      .select("_id");

      
      if (copies.length === 0) {
        return res.status(404).json({ message: "No available copies found" });
      }

      const book = await Book.findById(id).select("total_copies");
      if(book && book.total_copies === qty){
        await Book.findByIdAndUpdate(id, {deleted: true, deleted_at: new Date()});
      }

    // 2. Update only selected copies
    await BookCopy.updateMany(
      { _id: { $in: copies.map(c => c._id) } },
      { deleted: true, deleted_at: Date.now() }
    );

    // 3. Decrease total_copies by actual updated amount
    await Book.findByIdAndUpdate(id, {
      $inc: { total_copies: -copies.length },
    });

    res.status(200).json({
      message: `${copies.length} copies moved to recycle bin`,
    });

  } catch (error) {
    res.status(400).json({
      message: "Error moving copies to recycle bin: " + error.message,
    });
  }
};


// delete all available copies permanently
const deleteAllAvailableCopiesPermanently = async (req, res) => {
  try {
    const { id } = req.params;
    const copies = await BookCopy.find({ book_id: id, status: {$ne: "unavailable"}, deleted: true });
    if (copies.length === 0) {
      return res.status(404).json({ message: "No available copies found" });
    }
    await BookCopy.deleteMany({ book_id: id, status: {$ne: "unavailable"}, deleted: true });

    await Book.deleteOne({_id: id, deleted: true});
    res
      .status(200)
      .json({ message: "All available copies deleted permanently" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting copies permanently " + error.message });
  }
};

// restore all available copies from recycle bin
const restoreFromRecycleBin = async (req, res) => {
  try {
    const { id } = req.params;
    const copies = await BookCopy.updateMany(
      { book_id: id, status: "available", deleted: true },
      { deleted: false, deleted_at: null },
    );
    if (copies.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No available copies found in recycle bin" });
    }
    await Book.updateOne({_id: id, deleted: true}, { deleted: false, deleted_at: null});
    await Book.findByIdAndUpdate(id, {
      $inc: { total_copies: copies.modifiedCount },
    });
    return res
      .status(200)
      .json({ message: "All available copies restored from recycle bin" });
  } catch (error) {
    res.status(400).json({
      message: "Error restoring copies from recycle bin " + error.message,
    });
  }
};

module.exports = {
  addBookCopy,
  moveCopyToRecycleBin,
  deleteCopyPermanently,
  moveAvailableCopiesByQuantity,
  deleteAllAvailableCopiesPermanently,
  restoreFromRecycleBin,
};
