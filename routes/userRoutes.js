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
  subject: 'Registration Succesfully...',
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
      color: #333; /* Default text color */
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
      color: #007bff; /* Updated color */
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
    <p>Dear ${user.name},</p> <!-- Default text color -->
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

res.redirect('/signupSuccess');

} catch (err) {
  res.send(err.message, "Error")
  }
});

router.post('/userLogin', async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });
    if (!user) {
      return res.send('User Not Found!');
    }
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
      return res.send('Wrong Password');
    }

    const accessToken = await authFile.token(user);
    res.cookie('access-token', accessToken, {
      maxAge: 60 * 60 * 24 * 30 * 1000,
    });

    res.status(200).redirect('/home');
  } catch (err) {
    console.log(err);
    res.send('An error occurred while processing your request');
  }
});

module.exports = router;
