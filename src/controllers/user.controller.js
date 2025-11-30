const User = require("../models/user");

// create user
const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user).select("-password");
  } catch (error) {
    res.status(500).json({ message: "Error create user " + error.message });
  }
};

// get users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "Sorry, no users found" });
    }
    return res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error get users " + err.message });
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
};
