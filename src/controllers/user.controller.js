const User = require("../models/user");

// create user
const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({message: 'Create user ('+user.username+') successfully!!' ,user}).select("-password");
  } catch (error) {
    res.status(500).json({ message: "Create user failed!!" });
  }
};

// get users
const getUsers = async (req, res) => {
  try {
    const { filter, search, filterStatus } = req.query;
    const filters = filter.split(',');

    const query = {};
    if(filters, filters[0]) {
      query.role = { $in: filters};
    }

    if (filterStatus) {
      query.status = { $eq: filterStatus === 'active' ? true : false }
    }

    if(search) {
      query.$or = [
        {username: { $regex: search, $options: "i"}},
        {"contact.phone_number": { $regex: search, $options: "i"}},
        {"contact.email": { $regex: search, $options: "i"}},
      ]
    }

    const pipline = [
      { $match: query },
      {
        $project: {
          username: 1,
          role: 1,
          image_url: 1,
          status: 1,
          start_date: 1,
          contact: 1,
          address: 1,
        },
      },
    ];
    const users = await User.aggregate(pipline);
    if (users.length === 0) {
      return res.status(404).json({ message: "Sorry, no users found" });
    }
    return res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error get users " + err.message });
  }
};

// get userdetails
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Sorry, user not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: "Error get user details " + err.message });
  }
};

// update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: "Sorry, user not found" });
    }
    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error update user " + err.message });
  }
};

// update user's status to false
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "Sorry, user not found" });
    }
    return res
      .status(200)
      .json({ message: "Changed user status to " + user.status });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error update user status " + err.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
  getUserDetails,
};
