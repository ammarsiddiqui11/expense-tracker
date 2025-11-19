// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTP } = require('../utils/otp');

const JWT_SECRET = process.env.JWT_SECRET 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const OTP_TTL_MIN = 10; // minutes

function signToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password required" });
    }

    // Check if a user exists with email or username
    const existing = await User.findOne({ $or: [{ email }, { username }] });

    // If exists and VERIFIED → block
    if (existing && existing.isVerified) {
      return res.status(409).json({ message: "User with email or username already exists" });
    }

    // If exists but NOT verified → resend OTP
    if (existing && !existing.isVerified) {
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

      existing.otp = otp;
      existing.otpExpiry = otpExpiry;
      await existing.save();

      await sendOTP(email, otp, "signup");

      return res.status(200).json({
        message: "Account exists but not verified. New OTP sent.",
        userId: existing._id,
      });
    }

    // Fresh signup
    const hashed = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    const user = await User.create({
      username,
      email,
      password: hashed,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await sendOTP(email, otp, "signup");

    return res.status(201).json({
      message: "User created. OTP sent to email. Please verify.",
      userId: user._id,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};


exports.verifySignup = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: 'userId and otp required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'user not found' });
    if (user.isVerified) return res.status(400).json({ message: 'user already verified' });

    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'invalid otp' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'otp expired' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user);
    return res.json({ message: 'verified', token });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { emailOrUsername, password, requestOtp } = req.body;
    if (!emailOrUsername || !password) return res.status(400).json({ message: 'emailOrUsername and password required' });

    const query = emailOrUsername.includes('@') ? { email: emailOrUsername } : { username: emailOrUsername };
    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ message: 'invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'invalid credentials' });

    if (!user.isVerified) {
      // resend OTP if not verified
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
      await user.save();
      await sendOTP(user.email, otp, 'signup-resend');
      return res.status(403).json({ message: 'account not verified. OTP resent to email', userId: user._id });
    }

    // Optional: if client wants OTP on signin, send OTP and ask to verify for token
    if (requestOtp) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
      await user.save();
      await sendOTP(user.email, otp, 'signin');
      return res.json({ message: 'OTP sent for signin', userId: user._id });
    }

    const token = signToken(user);
    return res.json({ token, message: 'signin successful' });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.verifySigninOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: 'userId and otp required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'user not found' });

    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'invalid otp' });
    if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'otp expired' });

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user);
    return res.json({ token, message: 'signin verified' });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'no user with that email' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
    await user.save();
    await sendOTP(user.email, otp, 'forgot-password');

    return res.json({ message: 'OTP sent to email', userId: user._id });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId,  newPassword } = req.body;
    if (!userId ||  !newPassword) return res.status(400).json({ message: 'userId, otp and newPassword required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'user not found' });
    // if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'invalid otp' });
    // if (user.otpExpiry < Date.now()) return res.status(400).json({ message: 'otp expired' });

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({ message: 'password reset successful' });
  } catch(err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
exports.verifyForgotOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: 'userId and otp required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'user not found' });

    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ message: 'invalid otp' });

    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: 'otp expired' });

    return res.json({ message: "OTP verified" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'server error' });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const user = await User.findById(req.user._id); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    // hash the new one
    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.requestChangePasswordOTP = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    // generate OTP
    const otp = generateOTP();

    // hash new password now (safer)
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);
    user.tempPassword = hashedNewPassword;  // store hashed new password temporarily

    await user.save();
    await sendOTP(user.email, otp, "change-password");

    res.json({ message: "OTP sent to email", userId: user._id });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyChangePasswordOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "userId and otp required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || !user.otpExpiry || !user.tempPassword) {
      return res.status(400).json({ message: "No OTP request found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // update password from stored hashed password
    user.password = user.tempPassword;

    // cleanup
    user.otp = null;
    user.otpExpiry = null;
    user.tempPassword = null;

    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};


