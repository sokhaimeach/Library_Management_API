const Book = require("../models/book");
const BookCopy = require("../models/bookcopy");
const BorrowRecord = require("../models/borrowrecord");
const Member = require("../models/member");
const Category = require("../models/category");
const Author = require("../models/author");
const User = require("../models/user");
const Penalty = require("../models/penalty");

function getStartOfWeekUTC(date = new Date()) {
  const d = new Date(date);
  const day = (d.getUTCDay() + 6) % 7; // Monday=0 ... Sunday=6
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// get number info of each module
const getKpis = async (req, res) => {
  try {
    const now = new Date();
    const week = getStartOfWeekUTC(now);

    let kpis = [];

    const totalBooks = await BookCopy.countDocuments({ deleted: false });
    const totalCurrentBooks = await BookCopy.countDocuments({
      deleted: false,
      create_at: { $gte: week, $lte: now },
    });

    kpis.push({
      label: "Total Books",
      value: totalBooks,
      delta: totalCurrentBooks,
      deltaText:
        totalCurrentBooks >= 0
          ? `+${totalCurrentBooks} this week`
          : `${totalCurrentBooks} this week`,
      icon: "bi-book",
    });

    const totalMember = await Member.countDocuments();
    const totalCurrentMember = await Member.countDocuments({
      join_date: { $gte: week, $lte: now },
    });
    kpis.push({
      label: "Total Members",
      value: totalMember,
      delta: totalCurrentMember,
      deltaText:
        totalCurrentMember >= 0
          ? `+${totalCurrentMember} this week`
          : `${totalCurrentMember} this week`,
      icon: "bi-people",
    });

    const totalBorrow = await BorrowRecord.countDocuments();
    const totalCurrentBorrow = await BorrowRecord.countDocuments({
      borrow_date: { $gte: week, $lte: now },
    });
    kpis.push({
      label: "Borrowed",
      value: totalBorrow,
      delta: totalCurrentBorrow,
      deltaText:
        totalCurrentBorrow >= 0
          ? `+${totalCurrentBorrow} this week`
          : `${totalCurrentBorrow} this week`,
      icon: "bi-box-arrow-up-right",
    });

    const totalCategories = await Category.countDocuments();
    const totalCurrentCategory = await Category.countDocuments({
      create_at: { $gte: week, $lte: now },
    });
    kpis.push({
      label: "Category",
      value: totalCategories,
      delta: totalCurrentCategory,
      deltaText:
        totalCurrentCategory >= 0
          ? `+${totalCurrentCategory} this week`
          : `${totalCurrentCategory} this week`,
      icon: "bi-tags",
    });

    const totalAuthors = await Author.countDocuments();
    const totalCurrentAuthors = await Author.countDocuments({
      create_at: { $gte: week, $lte: now },
    });
    kpis.push({
      label: "Author",
      value: totalAuthors,
      delta: totalCurrentAuthors,
      deltaText:
        totalCurrentAuthors >= 0
          ? `+${totalCurrentAuthors} this week`
          : `${totalCurrentAuthors} this week`,
      icon: "bi-feather",
    });

    const totalOverdue = await BorrowRecord.countDocuments({
      status: "overdue",
    });
    const totalCurrentOverdue = await BorrowRecord.countDocuments({
      status: "overdue",
      create_at: { $gte: week, $lte: now },
    });
    kpis.push({
      label: "Overdue",
      value: totalOverdue,
      delta: totalCurrentOverdue,
      deltaText:
        totalCurrentOverdue >= 0
          ? `+${totalCurrentOverdue} vs last week`
          : `${totalCurrentOverdue} vs last week`,
      icon: "bi-alarm",
    });

    const penaltyPending = await Penalty.countDocuments({ status: "pending" });
    const penaltyCurrentPending = await BorrowRecord.countDocuments({
      status: "pending",
      create_at: { $gte: week, $lte: now },
    });
    kpis.push({
      label: "Penalties Pending",
      value: penaltyPending,
      delta: penaltyCurrentPending,
      deltaText:
        penaltyCurrentPending >= 0
          ? `+${penaltyCurrentPending} vs last week`
          : `${penaltyCurrentPending} vs last week`,
      icon: "bi-receipt",
    });

    const totalStaffs = await User.countDocuments();
    const totalCurrentStaffs = await User.countDocuments({
      start_date: { $gte: week, $lte: now },
    });
    kpis.push({
      label: "Total Staffs",
      value: totalStaffs,
      delta: totalCurrentStaffs,
      deltaText:
        totalCurrentStaffs >= 0
          ? `+${totalCurrentStaffs} vs last week`
          : `${totalCurrentStaffs} vs last week`,
      icon: "bi-person-circle",
    });

    return res.status(200).json(kpis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get the borrows that are overdue in 3 days
const getOverdueBorrows = async (req, res) => {
  try {
    const now = new Date();
    const date = new Date(now.setDate(now.getDate() + 3));

    const pipline = [
      {
        $match: {
          status: "overdue",
          due_date: {
            $lte: date,
          },
        },
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
        $project: {
          member_name: "$member.name",
          book_title: "$book.title",
          status: 1,
          borrow_date: 1,
          due_date: 1,
          return_date: 1,
        },
      },
      {
        $sort: {
          due_date: 1,
        },
      },
      {
        $limit: 5,
      },
    ];
    const records = await BorrowRecord.aggregate(pipline);
    res.status(200).json(records);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get available books vs borrowed BorrowRecord
const getAvailableVsBorrowed = async (req, res) => {
  try {
    const available = await BookCopy.countDocuments({
      deleted: false,
      status: "available",
    });
    const borrowed = await BorrowRecord.countDocuments({ status: "overdue" });
    const borrowedPct = Math.round((borrowed / available) * 100 * 100) / 100;
    res.status(200).json({
      available,
      borrowed,
      borrowedPct,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get borrow trend in a week
const getBorrowTrend = async (req, res) => {
  try {
    const now = new Date();
    const monday = getStartOfWeekUTC(now);

    const pipeline = [
      {
        $match: {
          borrow_date: {
            $gte: monday,
            $lte: now,
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$borrow_date",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];
    const trend = await BorrowRecord.aggregate(pipeline);

    const map = new Map(trend.map((item) => [item._id, item.count]));

    let cur = new Date(monday);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const trendborrowed = [];

    while (cur < end) {
      const key = cur.toISOString().slice(0, 10);
      trendborrowed.push(map.get(key) || 0);
      cur.setDate(cur.getDate() + 1);
    }

    res.status(200).json(trendborrowed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get status breakdown
const getStatusBreakdown = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ];
    const statusBreakdown = await BorrowRecord.aggregate(pipeline);
    const breakdown = new Map(
      statusBreakdown.map((item) => [item._id, item.count]),
    );

    const labels = Array.from(breakdown.keys());
    const data = Array.from(breakdown.values());

    res.status(200).json({ labels, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get top categories
const getTopCategories = async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "books",
          localField: "book_id",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: {
          path: "$book",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "book.category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$book.category_id",
          category_name: { $first: "$category.name" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
    ];
    const topCategories = await BorrowRecord.aggregate(pipeline);
    console.log(topCategories);
    const labels = topCategories.map((item) => item.category_name);
    const data = topCategories.map((item) => item.count);

    res.status(200).json({ labels, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get recent borrow records
const getRecentBorrows = async (req, res) => {
  try {
    const pipeline = [
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
          return_date: 1,
        },
      },
      {
        $sort: {
          borrow_date: -1,
        },
      },
      {
        $limit: 5,
      },
    ];
    const records = await BorrowRecord.aggregate(pipeline);
    res.status(200).json(records);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get recent penalties
const getRecentPenalties = async (req, res) => {
  try {
    const pipeline = [
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
          created_at: 1,
          received_at: 1,
        },
      },
      { $sort: { created_at: -1 } },
      { $limit: 5 },
    ];
    const data = await Penalty.aggregate(pipeline);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getKpis,
  getOverdueBorrows,
  getAvailableVsBorrowed,
  getBorrowTrend,
  getStatusBreakdown,
  getTopCategories,
  getRecentBorrows,
  getRecentPenalties,
};
