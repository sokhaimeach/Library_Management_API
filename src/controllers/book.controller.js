const { default: mongoose } = require("mongoose");
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
    const { category_ids, search } = req.query;
    const categories = category_ids.split(",");
    const matchStage = { deleted: false };
    if (categories.length > 0 && categories[0]) {
      matchStage.category_id = {
        $in: categories.filter(id => id).map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if(search){
      matchStage.$or = [
        {title: {$regex: search, $options: "i"}},
        {"author.name": {$regex: search, $options: "i"}},
        {"category.name": {$regex: search, $options: "i"}},
      ]
    }
    const pipeline = [
      {
        $lookup: {
          from: "bookcopies",
          let: { bookId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$book_id", "$$bookId"] },
                    { $eq: ["$deleted", false] },
                    { $eq: ["$status", "available"] }, // or is_available:true
                  ],
                },
              },
            },
            { $count: "available" },
          ],
          as: "available_info",
        },
      },
      {
        $addFields: {
          available_copies: {
            $ifNull: [{ $first: "$available_info.available" }, 0],
          },
        },
      },

      {
        $lookup: {
          from: "authors",
          localField: "author_id",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $match: matchStage },
      {
        $project: {
          title: 1,
          cover_url: 1,
          author_id: 1,
          category_id: 1,
          published_date: 1,
          price: 1,
          total_copies: 1,
          available_copies: 1,
          description: 1,
          author_name: "$author.name",
          category_name: "$category.name",
        },
      },
    ];

    const data = await Book.aggregate(pipeline);
    if (data.length === 0) {
      return res.status(200).json({ message: "No books found" });
    }
    return res
      .status(200)
      .json({ message: "Books fetched successfully", data });
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

// get all books from recycle moveBookToRecycleBin
const getAllRemoveBook = async (req, res) => {
  try {
    const { search } = req.query;
    let matchStage = {};
    if(search) {
      matchStage.title = { $regex: search, $options: "i"}
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "bookcopies",
          localField: "_id",
          foreignField: "book_id",
          as: "copies",
        },
      },
      {
        $addFields: {
          deletedCopies: {
            $filter: {
              input: "$copies",
              as: "copy",
              cond: { $eq: ["$$copy.deleted", true] },
            },
          },
        },
      },
      {
        $addFields: {
          deleted_copies: { $size: "$deletedCopies" },
          deleted_at: { $max: "$deletedCopies.deleted_at" },
        },
      },
      {
        $match: { deleted_copies: { $gt: 0 } },
      },
      {
        $project: {
          title: 1,
          cover_url: 1,
          total_copies: 1,
          deleted_copies: 1,
          deleted_at: 1,
        },
      },
    ];

    const data = await Book.aggregate(pipeline);
    if (data.length === 0) {
      return res.status(200).json({ message: "No delete book found", data: [] });
    }
    return res.status(202).json({ message: "Get all delete book", data });
  } catch (err) {
    res.status(400).json({
      message: "Error getting all books from recycle bin" + err.message,
    });
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
  getAllRemoveBook,
};
