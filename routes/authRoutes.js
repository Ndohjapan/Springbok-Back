const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/verify-otp", authController.verify);
router.post("/resend-otp", authController.protect, authController.resendOtp);
router.post("/senduserOTP", authController.sendUserOTP)
router.post("/resetPassword", authController.resetPassword)

module.exports = router;
