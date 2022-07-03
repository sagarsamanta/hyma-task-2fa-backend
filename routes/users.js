const express = require("express");
const router = express.Router();
const user = require("../controllers/user");
// login user
router.post("/login", user.login);
//register a user
router.post("/register", user.signUp);
//user verify otp
router.post("/verifyOtp", user.verifyOtp);
//resend otp
router.post("/resendOtp", user.resendOtp);
//edit user
router.post("/editUser", user.editUser);
module.exports = router;
