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
  text:`Dear ${user.name},\n\nThank You For Registering...\n\nUsername : "${userName}" \nPassword : "${password}"`,
};

transPorter.sendMail(mailOptions, (err, info) =>{
  if(err){
      console.log(err, "Email Sent Failed...");
  }else {
      console.log("Email Sent Successfully....");
  }
});

res.redirect('/signupSuccess');

} catch (error) {
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
