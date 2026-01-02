const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { verifyRoles } = require("../middleware/role.middleware");
const { getMemberBorrow, getMemberPenalty } = require('../controllers/memberHistory.controller');
const ROLE = process.env.ROLES.split(",");

router.get('/borrow/:id', protect, verifyRoles(ROLE[0], ROLE[1]), getMemberBorrow);
router.get('/penalty/:id', protect, verifyRoles(ROLE[0], ROLE[1]), getMemberPenalty)

module.exports = router;