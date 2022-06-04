const express = require("express");
const router = express.Router();
const {adminSignin, adminSignup, protect, resendOtp, resetPassword, permissionTo: restrictTo, sendUserOTP, signin, signup, verify, restaurantSignin} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/adminSignup", adminSignup);
router.post("/signin", signin);
router.post("/adminSignin", adminSignin);
router.post("/restaurantSignin", restaurantSignin)
router.post("/verify-otp", verify);
router.post("/resend-otp", protect, resendOtp);
router.post("/senduserOTP", sendUserOTP)
router.post("/resetPassword", resetPassword)

module.exports = router;
