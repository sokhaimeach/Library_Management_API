const User = require("../models/user");

const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    const { oldPassword, newPassword } = req.body;
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Password must be at least 4 characters long" });
  }
};

module.exports = {
  changePassword,
  resetPassword,
};
