const UserOtpVerification = require("../models/UserOtpVerification");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const nodemailer = require("nodemailer");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isValidUser = await User.find({ email, verified: true });
    if (isValidUser.length <= 0) {
      throw new Error("Invalid user details.");
    } else {
      const hashedPassword = isValidUser[0].password;
      const isValidPassword = await bcrypt.compare(password, hashedPassword);
      if (!isValidPassword) {
        throw new Error("Invalid user details.");
      } else {
        res.status(200).json({
          message: "Sucessfull.",
          user: isValidUser[0],
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      status: "FAILED",
      message: err.message,
    });
  }
};
exports.signUp = async (req, res) => {
  let { name, email, password, phoneNumber } = req.body;
  try {
    const isAlreadyExist = await User.findOne({ email });
    if (isAlreadyExist) {
      res.status(201).json({ message: "Email Alredy Exists" });
    } else {
      const saltRound = 10;
      const hashPassword = await bcrypt.hash(password, saltRound);
      const newUser = new User({
        name,
        email,
        password: hashPassword,
        phoneNumber,
        verified: false,
      });
      const user = await newUser.save();
      sendVerificationEmail(user, res);
    }
  } catch (err) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.editUser = async (req, res) => {
  try {
    const { userId, name, phoneNumber } = req.body;
    const user = await User.findOne({ userId, verified: true });
    if (user) {
      if (name) user.name = name;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      await user.save();
      res.status(200).json({
        message: "SUCCESSFULLY UPDATED",
        user: user,
      });
    } else {
      res.json({ message: "User Not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let { otp, userId } = req.body;
    if (!userId || !otp) {
      throw Error("Empty otp not allowed!");
    } else {
      const userOtpVerificationRecord = await UserOtpVerification.find({
        userId,
      });
      if (userOtpVerificationRecord.length <= 0) {
        throw new Error(
          "Account record doesn't exist or hase been verified alredy.Please sign up or login"
        );
      } else {
        const { expiresAt } = userOtpVerificationRecord[0];
        const hashOtp = userOtpVerificationRecord[0].otp;
        if (expiresAt < Date.now()) {
          await UserOtpVerification.deleteMany({ userId });
          throw new Error("Code hase expired .Please request again.");
        } else {
          const isValidOtp = await bcrypt.compare(otp, hashOtp);
          if (!isValidOtp) {
            throw new Error("Invalid otp,check otp again.");
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await UserOtpVerification.deleteMany({ userId });
            const user = await User.find({ userId });
            res.status(200).json({
              status: "VERIFIED",
              message: "User email verified successfully.",
              user: user,
            });
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
exports.resendOtp = async (req, res) => {
  try {
    let { email, userId } = req.body;
    if (!userId || !email) {
      throw Error("Empty user details!");
    } else {
      await UserOtpVerification.deleteMany({ userId });
      sendVerificationEmail({ _id: userId, email }, res);
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: err.message,
    });
  }
};
const sendVerificationEmail = async ({ _id, email }, res) => {
  try {
    let otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: `${process.env.EMAIL}`,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter ${otp} is the app to verify your email address</p><p>This code expires in 1 hour </b></p>`,
    };
    const saltRound = 10;
    const hashOtp = await bcrypt.hash(otp, saltRound);
    const newOtpVerication = new UserOtpVerification({
      userId: _id,
      otp: hashOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    await newOtpVerication.save();
    let transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.PASSWORD}`,
      },
    });
    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        res.status(500).json({
          message: error.message,
        });
      } else {
        res.status(200).json({
          message: "Verification otp sent to email",
          status: "PENDING",
          data: {
            userId: _id,
            email,
          },
        });
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};
