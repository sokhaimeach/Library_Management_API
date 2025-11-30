const User = require("../models/user");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const passwordMatching = await user.matchPassword(password);
    if (!user || !passwordMatching) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const token = generateToken(user._id);
    return res.status(200).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid username or password", error: error.message });
  }
};

module.exports = { login };
