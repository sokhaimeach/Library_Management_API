const mongoose = require("mongoose");
const BorrowRecord = require("../models/borrowrecord");
const Penalty = require("../models/penalty");

// get borrow record by member id
const getMemberBorrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { filter, search } = req.query;

    let query = { member_id: new mongoose.Types.ObjectId(id) };
    if (filter) {
      query.status = { $eq: filter };
    }

    if (search) {
      query["book.title"] = { $regex: search, $options: "i" };
    }
    const pipline = [
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
          from: "books",
          localField: "book_id",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $match: query,
      },
      {
        $project: {
          member_name: "$member.name",
          book_title: "$book.title",
          status: 1,
          borrow_date: 1,
          due_date: 1,
          return_date: 1,
        },
      },
    ];
    const records = await BorrowRecord.aggregate(pipline);
    if (records.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(records);
  } catch (err) {
    res.status(400).json({ message: "Error get member borrow " + err.message });
  }
};

// get penalty by memberid
const getMemberPenalty = async (req, res) => {
  try {
    const { id } = req.params;
    const { filter, search } = req.query;

    let query = { member_id: new mongoose.Types.ObjectId(id) };
    if (filter) {
      query.status = { $eq: filter };
    }

    if (search) {
      query.penalty_type = { $regex: search, $options: "i" };
    }

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
        $match: query,
      },
      {
        $project: {
          member_name: "$member.name",
          phone_number: "$member.contact.phone_number",
          penalty_type: 1,
          amount: 1,
          status: 1,
          note: 1,
          created_at: 1,
          received_at: 1,
        },
      },
    ];
    const data = await Penalty.aggregate(pipline);

    if (data.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(data);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error get member penalty : " + err.message });
  }
};

module.exports = { getMemberBorrow, getMemberPenalty };
