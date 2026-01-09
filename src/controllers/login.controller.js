const User = require("../models/user");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Invalid username or password" });
    }
    if(!user.status) {
      return res.status(404).json({message: "This user has been disable"});
    }
    const passwordMatching = await user.matchPassword(password);
    if (!user || !passwordMatching) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const token = generateToken(user._id);
    return res.status(200).json({
      message: "Login successfully",
      data: {
        _id: user._id,
        username: user.username,
        image_url: user.image_url,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid username or password", error: error.message });
  }
};

const loginByEmail = async (req, res) => {
  try {
    const user = await User.findOne(req.body);
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if(!user.status) {
      return res.status(404).json({message: "This user has been disable"});
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      message: "Login successfully",
      data: {
        _id: user._id,
        username: user.username,
        image_url: user.image_url,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid email", error: error.message });
  }
};

module.exports = { login, loginByEmail };
