const crypto = require('crypto');
const nodemailer = require('nodemailer');

function generateOTP(len = 6) {
  const num = crypto.randomInt(0, Math.pow(10, len));
  return String(num).padStart(len, '0');
}

async function sendOTP(email, otp, context = '') {
    console.log(otp)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    const info = await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your OTP Code`,
      html: `
        <div style="padding: 20px; font-family: Arial; border: 1px solid #ddd;">
          <h2>Your OTP for ${context}</h2>
          <p style="font-size: 18px;">Your OTP is:</p>
          <h1 style="letter-spacing: 4px; color: #222;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    });

    console.log('OTP email sent:', info.messageId);
    return true;

  } catch (err) {
    console.error('Error sending OTP:', err);
    return false;
  }
}

module.exports = { generateOTP, sendOTP };
