const BorrowRecord = require("../models/borrowrecord");
const BookCopy = require("../models/bookcopy");
const Member = require("../models/member");
const Book = require("../models/book");
const Penalty = require("../models/penalty");
const { default: mongoose } = require("mongoose");

// get all borrow record
const getAllRecord = async (req, res) => {
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
        $project: {
          member_name: "$member.name",
          book_title: "$book.title",
          status: 1,
          borrow_date: 1,
          due_date: 1,
        },
      },
    ];
    const records = await BorrowRecord.aggregate(pipline);
    if (records.length === 0) {
      res.status(404).json({ message: "No borrow record found!" });
    }
    res.status(200).json(records);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error get all borrow record " + err.message });
  }
};

// create borrow record
const createRecord = async (req, res) => {
  try {
    const { member_id, book_id } = req.body;
    const user_id = req.user.id;
    // check if member is blacklisted
    const member = await Member.findById(member_id);
    if (member.member_type === "blacklist") {
      return res.status(403).json({ message: "Member is blacklisted" });
    }
    // count borrow record of member that is not returned yet
    const count = await BorrowRecord.countDocuments({
      member_id,
      status: "overdue",
    });
    if (count > 0 && member.member_type === "regular") {
      return res
        .status(403)
        .json({ message: "Member has reached maximum borrow limit" });
    } else if (count >= 3) {
      return res
        .status(403)
        .json({ message: "VIP Member has reached maximum borrow limit" });
    }
    // find available copy
    const copy = await BookCopy.findOne({ book_id, status: "available" });
    if (!copy) {
      res.status(404).json({ message: "No available copy found" });
    }
    // update copy status to unavailable
    await BookCopy.findByIdAndUpdate(
      copy._id,
      { status: "unavailable" },
      { new: true },
    );
    // record borrow
    await BorrowRecord.create({
      member_id,
      copy_id: copy._id,
      book_id,
      user_id,
    });
    res.status(200).json({ message: "Borrow has bean record!" });
  } catch (err) {
    res.status(400).json({ message: "Error create record " + err.message });
  }
};

// get borrow record details
const getRecordDetails = async (req, res) => {
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
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
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
          member: 1,
          book: {
            title: 1,
            cover_url: 1,
            price: 1,
            total_copies: 1,
            category: "$category_info.name",
            author_name: "$author.name",
          },
          user: {
            username: 1,
            contact: 1,
          },
        },
      },
    ];
    const record = await BorrowRecord.aggregate(pipline);
    if (!record) {
      return res.status(404).json({ message: "Borrow record not found" });
    }
    res.status(200).json(record);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error get borrow record details " + err.message });
  }
};

// update borrow record status
const updateRecordStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, damage_type, damage_fee } = req.body;
    const record = await BorrowRecord.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!record) {
      return res.status(404).json({ message: "Borrow record not found" });
    }
    // update book copy status based on status
    res.status(200).json({
      message: await updateBookCopyStatusAndCreatePenalty(
        record,
        damage_type,
        damage_fee,
      ),
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error update borrow record status " + err.message });
  }
};

// update book copy status and create penalty
async function updateBookCopyStatusAndCreatePenalty(
  record,
  damage_type,
  damage_fee,
) {
  switch (record.status) {
    case "returned": {
      const copy = await BookCopy.findByIdAndUpdate(record.copy_id, {
        status: "available",
      });
      if (!copy) {
        return "Book copy not found";
      }
      return "Book copy status updated";
    }
    case "lost": {
      const copy = await BookCopy.findByIdAndUpdate(record.copy_id, {
        status: "lost",
      });
      if (!copy) {
        return "Book copy not found";
      }
      const book = await Book.findById(record.book_id);
      if (!book) {
        return "Book not found";
      }
      await Penalty.create({
        member_id: record.member_id,
        borrow_id: record._id,
        penalty_type: "lost",
        amount: book.price,
        note: "Book lost",
      });
      await Member.findByIdAndUpdate(record.member_id, {
        status: "blacklist",
      });
      return "Member has been added to blacklist and penalized for lost book";
    }
    case "late": {
      const copy = await BookCopy.findByIdAndUpdate(record.copy_id, {
        status: "available",
      });
      if (!copy) {
        return "Book copy not found";
      }
      let fine_fee = 0;
      const lateDays = Math.ceil(
        (record.return_date - record.due_date) / (1000 * 60 * 60 * 24),
      );
      if (lateDays > 0) {
        if (lateDays < 7) {
          return "Book returned within 7 days, no penalty";
        } else if (lateDays < 14) {
          fine_fee = 0.5;
        } else if (lateDays < 21) {
          fine_fee = 1;
        } else {
          fine_fee = 2;
        }
      } else {
        return "Book returned on time";
      }
      await Penalty.create({
        member_id: record.member_id,
        borrow_id: record._id,
        penalty_type: "late",
        amount: fine_fee,
        note: `Book returned ${lateDays} days late`,
      });
      return "Member has been penalized for late return";
    }
    case "damaged": {
      if (damage_type === "can") {
        const copy = await BookCopy.findByIdAndUpdate(record.copy_id, {
          status: "available",
        });
        if (!copy) {
          return "Book copy not found";
        }
        await Penalty.create({
          member_id: record.member_id,
          borrow_id: record._id,
          penalty_type: "damaged",
          amount: damage_fee,
          note: "Book damaged",
        });
        return "Member has been penalized for damaged return";
      } else {
        const copy = await BookCopy.findByIdAndUpdate(record.copy_id, {
          deleted: true,
          deleted_at: Date.now(),
        });
        if (!copy) {
          return "Book copy not found";
        }
        const book = await Book.findByIdAndUpdate(
          record.book_id,
          { $inc: { total_copies: -1 } },
          { new: true },
        );
        if (!book) {
          return "Book not found";
        }
        await Penalty.create({
          member_id: record.member_id,
          borrow_id: record._id,
          penalty_type: "damaged",
          amount: book.price,
          note: "Book damaged",
        });
        await Member.findByIdAndUpdate(record.member_id, {
          status: "blacklist",
        });
        return "Member has been added to blacklist and penalized for damaged book";
      }
    }
  }
}

module.exports = {
  getAllRecord,
  createRecord,
  getRecordDetails,
  updateRecordStatus,
};
