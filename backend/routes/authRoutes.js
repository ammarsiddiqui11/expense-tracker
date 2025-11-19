// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/authController');
const { protect } = require("../middleware/authMiddleware");

router.post('/signup', ctrl.signup);
router.post('/verify-signup', ctrl.verifySignup);
router.post('/signin', ctrl.signin);
router.post('/verify-signin', ctrl.verifySigninOtp);
router.post('/forgot-password', ctrl.forgotPassword);
router.post("/verify-forgot-otp", ctrl.verifyForgotOtp);
router.post('/reset-password', ctrl.resetPassword);
router.put("/change-password", protect,ctrl.changePassword);
router.put("/change-password/request-otp", protect, ctrl.requestChangePasswordOTP);
router.post("/change-password/verify-otp", ctrl.verifyChangePasswordOTP);



// example protected route to get current user
router.get('/me', auth.protect, async (req, res) => {
  const { id } = req.user;
  const User = require('../models/User');
  const user = await User.findById(id).select('-password -otp -otpExpiry');
  res.json({ user });
});

module.exports = router;
