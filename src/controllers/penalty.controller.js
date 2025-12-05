const Penalty = require("../models/penalty");
const BorrowRecord = require("../models/borrowrecord");
const mongoose = require("mongoose");

// create new penalty
const createPenalty = async (req, res) => {
  try {
    const { borrow_id, penalty_type, amount, note } = req.body;
    const borrow = await BorrowRecord.findById(borrow_id);
    if (!borrow) {
      return res.status(404).json({ message: "Borrow record not found" });
    }
    const { member_id } = borrow;
    const penalty = new Penalty({
      member_id,
      borrow_id,
      penalty_type,
      amount,
      note,
    });
    await penalty.save();
    res.status(201).json({ message: "Penalty created successfully", penalty });
  } catch (err) {
    res.status(400).json({ message: "Error creating penalty: " + err.message });
  }
};

// get all penalty
const getAllPenalties = async (req, res) => {
  try {
    const pipline = [
      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "_id",
          as: "member",
        },
      },
      { $unwind: "$member" },
      {
        $project: {
          member_name: "$member.name",
          phone_number: "$member.contact.phone_number",
          penalty_type: 1,
          amount: 1,
          status: 1,
          note: 1,
          create_date: 1,
        },
      },
    ];
    const data = await Penalty.aggregate(pipline);
    res.status(200).json({ message: "Penalties retrieved successfully", data });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error getting penalties: " + err.message });
  }
};

// get penalty details
const getPenaltyDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const pipline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "members",
          localField: "member_id",
          foreignField: "_id",
          as: "member",
        },
      },
      {
        $unwind: "$member",
      },
      {
        $lookup: {
          from: "borrowrecords",
          localField: "borrow_id",
          foreignField: "_id",
          as: "borrow_info",
        },
      },
      {
        $unwind: "$borrow_info",
      },
      {
        $lookup: {
          from: "books",
          localField: "borrow_info.book_id",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $lookup: {
          from: "authors",
          localField: "book.author_id",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: {
          path: "$author",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "book.category_id",
          foreignField: "_id",
          as: "category_info",
        },
      },
      {
        $unwind: {
          path: "$category_info",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          penalty_type: 1,
          amount: 1,
          status: 1,
          note: 1,
          created_at: 1,
          received_at: 1,
          member: 1,
          book: {
            title: 1,
            cover_url: 1,
            price: 1,
            total_copies: 1,
            category: "$category_info.name",
            author_name: "$author.name",
          },
          borrow_info: {
            borrow_date: 1,
            due_date: 1,
            return_date: 1,
            status: 1,
          },
        },
      },
    ];
    const data = await Penalty.aggregate(pipline);
    if (!data) {
      return res.status(404).json({ message: "Penalty not found" });
    }
    res
      .status(200)
      .json({ message: "Penalty details retrieved successfully", data });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error getting penalty details: " + err.message });
  }
};

// updatePenalty status
const updatePenaltyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const received_at = Date.now();
    const penalty = await Penalty.findByIdAndUpdate(
      id,
      { status, received_at },
      { new: true },
    );
    if (!penalty) {
      return res.status(404).json({ message: "Penalty not found" });
    }
    res.status(200).json({ message: "Penalty status updated successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating penalty status " + err.message });
  }
};

// delete penalty
const deletePenalty = async (req, res) => {
  try {
    const { id } = req.params;
    const penalty = await Penalty.findById(id);
    if (!penalty) {
      return res.status(404).json({ message: "Penalty not found" });
    }
    if (penalty.status === "pending") {
      await Penalty.findByIdAndDelete(id);
      res.status(200).json({ message: "Penalty deleted successfully" });
    } else {
      res
        .status(400)
        .json({ message: "Cannot delete penalty that is already processed" });
    }
  } catch (err) {
    res.status(400).json({ message: "Error deleting penalty " + err.message });
  }
};

module.exports = {
  createPenalty,
  getAllPenalties,
  getPenaltyDetails,
  updatePenaltyStatus,
  deletePenalty,
};
