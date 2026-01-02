const Author = require("../models/author");

// create author
const createAuthor = async (req, res) => {
  try {
    const author = await Author.create(req.body);
    res.status(201).json({ message: "Author created successfully", id: author._id });
  } catch (err) {
    res.status(400).json({ message: "Error create Author " + err.message });
  }
};

// get all authors
const getAllAuthors = async (req, res) => {
  try {
    const { nation, search } = req.query;
    const nationalities = nation.split(",");

    let query = {};
    if (nationalities.length > 0 && nationalities[0] !== "") {
      query.nationality = { $in: nationalities };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nationality: { $regex: search, $options: "i" } },
      ];
    }

    console.log(query)

    const authors = await Author.find(query);
    if (authors.length === 0) {
      res.status(200).json({ message: "No authors found" });
    }
    res.status(200).json(authors);
  } catch (err) {
    res.status(400).json({ message: "Error get all Authors " + err.message });
  }
};

// update author info
const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findByIdAndUpdate(id, req.body, { new: true });
    if (!author) {
      res.status(404).json({ message: "Author not found" });
    }
    res.status(200).json({ message: "Author updated successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error update Author " + err.message });
  }
};

// delete author
const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findByIdAndDelete(id);
    if (!author) {
      res.status(404).json({ message: "Author not found" });
    }
    res.status(200).json({ message: "Author deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error delete Author " + err.message });
  }
};

module.exports = {
  createAuthor,
  getAllAuthors,
  updateAuthor,
  deleteAuthor,
};
