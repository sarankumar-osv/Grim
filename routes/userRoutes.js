const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const User = require("../models/user");
const Address = require("../models/address");
const Order = require('../models/order')
const nodemailer = require("nodemailer");
const collection = require("../models/user");
const authFile = require('../middleware/auth');
const router = express.Router();
router.use(express.json());
router.use(cookieParser());


router.use(express.urlencoded({extended: false }));
router.use(bodyParser.json());

// Signup
router.post('/saveRegisterDetails', async (req, res)=>{
  const user = new User({
      name : req.body.name,
      email : req.body.email,
      age : req.body.age,
      phone : req.body.phone,
      gender: req.body.gender
  });

// Generate Random Username

const uniqueNumber = Math.floor(1000 + Math.random()*9000);
const userName = `${user.name.toLowerCase()}${uniqueNumber}`;

user.userName = userName;

// Generate Random Password

const password = Math.random().toString(36).substring(2,8);
console.log(`Name : ${user.name} \nUsername: ${userName} \nPassword : ${password}`)

const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password,saltRounds);

user.password = hashedPassword;

// Send Mail
try {
  const a1 = await user.save()


const transPorter = nodemailer.createTransport({
  service:'gmail',
  auth:{
      user: 'verifyuserofficial@gmail.com',
      pass: 'wsdv megz vecp wzen'
  },
});

const mailOptions = {
  from :'verifyuserofficial@gmail.com',
  to: user.email,
  subject: 'Registration Successful!',
  html: `
  <!DOCTYPE html>
<html lang="en">
<head>
  <title>Welcome to Our Community!</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333; 
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 36px;
      color: #007bff;
      margin-bottom: 20px;
      text-align: center;
      text-transform: uppercase;
    }
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    ul {
      margin-bottom: 15px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .footer {
      font-size: 14px;
      color: #999;
      margin-top: 20px;
      text-align: center;
    }
    .highlight {
      background-color: #eaf6ff;
      padding: 5px 10px;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Our Community! 🎉</h1>
    <p>Dear ${user.name},</p> 
    <p>We are thrilled to welcome you to our community! Your account has been successfully created 🚀.</p>
    <p>Here are your login details:</p>
    <ul>
      <li><strong>Username : </strong> ${userName}</li>
      <li><strong>Password : </strong> ${password}</li>
    </ul>
    <p>If you have any questions or need further assistance, please feel free to <a href="mailto:verifyuserofficial@gmail.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
    <p>Best regards,<br>Saran Kumar.</p>
    <div class="footer">
      This is an automated message. Please do not reply to this email.
    </div>
  </div>
</body>
</html>
`
};

transPorter.sendMail(mailOptions, (err, info) =>{
  if(err){
      console.log(err, "Email Sent Failed...");
      res.send(err.message)
  }else {
      console.log("Email Sent Successfully....");
  }
});

res.render("signupSuccess");

} catch (err) {
  res.send(err.message, "Error")
  }
});

router.post("/userLogin", async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });
    if (!user) {
      return res.send(
        '<script>alert("Incorrect Username"); window.location.href = "/signin";</script>'
      );
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) {
      return res.send(
        '<script>alert("Wrong Password"); window.location.href = "/signin";</script>'
      );
    }

    const OTP = Math.floor(100000 + Math.random() * 900000);
    console.log(OTP);

    user.otp = OTP;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      to: user.email,
      subject: "Email Verification",
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            color: #333;
            margin: 0;
            padding: 0;
          }
      
          .container {
            width: 80%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #f5f5f5;
            border-radius: 5px;
            padding: 30px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
      
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
      
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #007bff; 
          }
      
          .content {
            line-height: 1.5;
          }
      
          .otp-code {
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            margin-bottom: 20px;
            border: 1px solid #ccc;
            padding: 10px 20px;
            border-radius: 5px;
          }
      
          .footer {
            text-align: center;
            font-size: 14px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello ${user.name},</p>
            <p>Please use the following OTP to verify your login:</p>
            <p class="otp-code">${OTP}</p>
            <p>This OTP is valid for 10 Minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Thank you.</p>
          </div>
        </div>
      </body>
      </html>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error sending OTP email:", err);
        return res.send(
          '<script>alert("Error sending OTP"); window.location.href = "/signin";</script>'
        );
      }
      console.log("OTP sent successfully");
      res.render("verifyOTP", {user: user} );
    });
  } catch (err) {
    console.log("Error in userLogin:", err);
    res.send("Internal Server Error");
  }
});

router.post("/verifyOTP", async (req, res) => {
  try {
    const user = await User.findOne({ otp: req.body.otp });

    if (!user) {
      console.log("User not found");
      return res.send(
        '<script>alert("Incorrect OTP or OTP Expired!"); window.location.href = "/verifyOTP";</script>'
      );
    }

    console.log("OTP Verified.");

    user.isOTPVerified = true;
    user.otp = null;
    await user.save();

    const accessToken = await authFile.token(user);
    res.cookie("access-token", accessToken, {
      maxAge: 10 * 60 * 1000,
    });

    res.redirect("/home");
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.send("Internal Server Error");
  }
});

router.get("/sendMail", async (req, res) => {
  try {
    const users = await User.find({}, "email");
    const userEmails = users.map((user) => user.email);
    console.log("All user emails:", userEmails);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      subject: "Happy New Year 🎉.",
    };

    for (let i = 0; i < userEmails.length; i++) {
      mailOptions.to = userEmails[i];
      mailOptions.html =`
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <title>Welcome to Our Community!</title>
      <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #ff9900;
        text-align: center;
      }
      p {
        margin-bottom: 15px;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #777777;
        text-align: center;
      }
      </style>
      </head>
      <body>
      <div class="container">
      <h1>HAPPY NEW YEAR 2024 🎉</h1>
      <p>Dear User,</p>
      <p>As we step into the new year, we want to extend our warmest wishes to you. May the year 2024 bring you joy, success, and prosperity in all your endeavors.<br><br> Have a Great Day 😊...</p>
      <p>If you have any questions or need further assistance, please feel free to <a href="mailto:verifyuserofficial@gmail.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
      <p>Best regards,<br>Saran Kumar.</p>
      <div class="footer">
      This is an automated message. Please do not reply to this email.
      </div>
      </div>
      </body>
      </html>
      `;

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(`Error sending email to ${userEmails[i]}:`, err);
        } else {
          console.log(`Email sent successfully to ${userEmails[i]}.`);
        }
      });
    }

    res.send("Mail Sent Successful...");
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error("Error:", err.message);
  }
});

module.exports = router;
