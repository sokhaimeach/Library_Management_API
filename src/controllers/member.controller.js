const Member = require("../models/member");

// create a new member
const createMember = async (req, res) => {
  try {
    const {
      name,
      contact: { phone_number, email },
    } = req.body;
    await Member.create({ name, contact: { phone_number, email } });
    res.status(201).json({ message: "Member created successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error creating member" + error.message });
  }
};

// get all members
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    if (members.length === 0) {
      res.status(404).json({ message: "No members found" });
    }
    res.status(200).json(members);
  } catch (err) {
    res.status(400).json({ message: "Error fetching members" + err.message });
  }
};

// update member info
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contact: { phone_number, email },
    } = req.body;
    const member = await Member.findByIdAndUpdate(id, {
      name,
      contact: { phone_number, email },
    });
    if (!member) {
      res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json({ message: "Member updated successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error updating member" + err.message });
  }
};

// change member type
const changeMemberType = async (req, res) => {
  try {
    const { id } = req.params;
    const { member_type } = req.body;
    const member = await Member.findByIdAndUpdate(
      id,
      { member_type },
      { new: true },
    );
    if (!member) {
      res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json({ message: "Member type changed successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error changing member type" + err.message });
  }
};

module.exports = {
  createMember,
  getAllMembers,
  updateMember,
  changeMemberType,
};
