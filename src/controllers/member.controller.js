const Member = require("../models/member");

// create a new member
const createMember = async (req, res) => {
  try {
    const {
      name,
      contact: { phone_number, email },
    } = req.body;
    const member = await Member.create({ name, contact: { phone_number, email } });
    res.status(201).json({ message: "Member created successfully", member });
  } catch (error) {
    res.status(400).json({ message: "Error creating member" + error.message });
  }
};

// get all members
const getAllMembers = async (req, res) => {
  try {
    const { filter, search } = req.query;
    const filters = filter.split(",");
    let query = {};
    if(filters.length > 0 && filters[0]){
      query.member_type = {$in: filters};
    }
    if(search){
      query.$or = [
        {name: {$regex: search, $options: "i"}},
        {"contact.phone_number": {$regex: search, $options: "i"}},
        {"contact.email": {$regex: search, $options: "i"}}
      ];
    }

    const members = await Member.find(query);
    if (members.length === 0) {
      res.status(200).json([]);
    }
    res.status(200).json(members);
  } catch (err) {
    res.status(400).json({ message: "Error fetching members" + err.message });
  }
};

// get member by id 
const getMemberById = async (req, res) => {
  try{
    const { id } = req.params;

    const member = await Member.findById(id);
    if(!member){
      return res.status(404).json({message: "member not found"});
    }

    return res.status(200).json(member);
  }catch(err){
    res.status(400).json({message: "Error get member by id : "+err.message});
  }
}

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
  getMemberById
};
