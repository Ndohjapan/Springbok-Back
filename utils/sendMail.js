const nodemailer = require("nodemailer");
const config = require("config");

let transporter = nodemailer.createTransport({
  "host": "smtpdm.aliyun.com",
  "port": 80,
  "secureConnection": true,
  "auth": {
      "user": 'user@banquapp.online',
      "pass": "jzpWJH57NfAgV25"
  }
});

function otpHtmlTemplate(otp) {
  return `
  <div class="container" style="max-width: 90%; margin: auto; padding-top: 20px;">
    <h2><span style="color='#fc6011';">Spring</span>Bok LCU</h2>
    <p style="margin-bottom: 30px;">Please enter the sign up OTP to get started</p>
    <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center; ">${otp}</h1>
   </div>
  `;
}

async function sendMail(receipientEmail, otp) {
  const senderEmail = "SpringBok user@banquapp.online";

  const mailOptions = {
    from: senderEmail,
    to: receipientEmail,
    subject: "SpringBok OTP Code ✅✅",
    text: `This is your SpringBok OTP Token: ${otp}`,
    html: otpHtmlTemplate(otp),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = sendMail;
