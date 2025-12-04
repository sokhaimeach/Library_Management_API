const Book = require("../models/book");
const BookCopy = require("../models/bookcopy");

// create book and copies
const createBook = async (req, res) => {
  try {
    const { total_copies } = req.body;
    const newbook = await Book.create(req.body);
    if (total_copies && total_copies > 0) {
      let copies = [];
      for (let i = 0; i < total_copies; i++) {
        copies.push({ book_id: newbook.id });
      }
      await BookCopy.create(copies);
    }
    res.status(201).json({
      message: "Book created successfully and " + total_copies + " copies",
    });
  } catch (err) {
    res.status(400).json({ message: "Error creating book" + err.message });
  }
};

// get all books
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({ deleted: false });
    if (books.length === 0) {
      res.status(200).json({ message: "No books found" });
    }
    res.status(200).json({ books });
  } catch (err) {
    res.status(400).json({ message: "Error fetching books" + err.message });
  }
};

// update book info
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(id, req.body, { new: true });
    if (!book) {
      res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book updated successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error updating book" + err.message });
  }
};

// move book to recycle bin
const moveBookToRecycleBin = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndUpdate(
      id,
      { deleted: true, deleted_at: Date.now() },
      { new: true },
    );
    if (!book) {
      res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book moved to recycle bin successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error moving book to recycle bin" + err.message });
  }
};

// delete book permanemtly
const deleteBookPermanently = async (req, res) => {
  try {
    const { id } = req.params;
    const findBook = await Book.findById(id);
    if (!findBook) {
      res.status(404).json({ message: "Book not found" });
    }
    if (findBook.total_copies === 0) {
      await Book.findByIdAndDelete(id);
      res
        .status(200)
        .json({ message: "Book deleted permanently successfully" });
    } else {
      res.status(400).json({ message: "You have to delete all copies first" });
    }
  } catch (err) {
    res.status(400).json({ message: "Error deleting book" + err.message });
  }
};
module.exports = {
  createBook,
  getAllBooks,
  updateBook,
  moveBookToRecycleBin,
  deleteBookPermanently,
};
