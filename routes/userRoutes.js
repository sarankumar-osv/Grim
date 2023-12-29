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
router.post("/saveRegisterDetails", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
    phone: req.body.phone,
    gender: req.body.gender,
  });

  // Genarate Random Password
    const password = Math.random().toString(36).substring(2,7);
    console.log(`Name : ${user.name} \nUsername : ${user.email} \nPassword : ${password}`);
  // Encrypt Password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;

  // Send Mail to the user
  try {
    const a1 = await user.save()
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'verifyuserofficial@gmail.com',
        pass: 'wsdv megz vecp wzen',
      },
    });
    
    const mailOptions = {
      from: 'verifyuserofficial@gmail.com',
      to: user.email,
      subject: 'Registration Successful',
      text: `Dear ${user.name},\n\nThank You For Registering...\n\nUsername - ${user.email}\n\nPassword - ${password}`,
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.json({ error: 'Failed to send registration email.' });
      } else {
        console.log('Email sent to user...');
        res.json({ message: 'Registration successful. Email sent.' });
      }
    });

    res.redirect("/signupSuccess");

} catch (err) {
  res.send("Error");
}

});

// Login

router.post("/userLogin", async (req, res) => {
    try {
      // Get user from db
        const user = await collection.findOne({ email: req.body.email });
        if (!user) {
            res.send("User not found")
        }
        //  Check Password
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            // res.send("Wrong Password");
            res.redirect('/');
        }
        else {
          const accessToken = await authFile.token(user);
          res.cookie("access-token", accessToken,{
          maxAge: 60* 60 * 24 * 30 * 1000
        });

          res.status(200).redirect("/home");
        }
    }
    catch (err){
        console.log(err);
    }
});

router.post("/createtoken", async (req, res) => {
  try {
    let user = {
      email : req.body.email,
      id : req.body.id
    };
    const accessToken = await authFile.token(user);
    console.log("accessToken - ",accessToken);
    res.json({accessToken : accessToken});
  } catch (error) {
     console.log(error.message)
  }
});


router.post("/addAddress", 
// authFile.newValidateToken,
 async (req, res) => {
  const body = req.body;
  const { permanentAddress, currentAddress, fkuserId } = body;

  const address = new Address({
    permanentAddress,
    currentAddress,
    fkuserId
  });

  try {
    await address.save();

    res.json({ message: 'Address added successfully', address });
  } catch (err) {
    console.error(err);
    res.json({ error: 'Internal Server Error' });
  }
});


router.get('/userAddressDetails', async (req, res) => {

  try {
    const user = await User.find({});

    if (user.length === 0){
      return res.json({ error: 'User not found' });
    }
     let responseData = {};
     let uList= [];
     for (let i = 0; i < user.length; i++) {
        let userData = user[i];
        let userObj = {};
        if(userData){
            let addressData = await Address.findOne({fkuserId:userData._id.toString()});
            userObj.details = userData;
            userObj.address = addressData;
            uList.push(userObj);
        }
    }
    responseData.uList = uList;
    return res.json(responseData);
    
  } catch (error) {
    console.error(error);
    res.json({ error: 'Internal Server Error' });
  }
});

router.get('/usersCities', async (req, res) => {
  try {
    const users = await User.find({});

    if (users.length === 0) {
      return res.json({ error: 'User not found' });
    }

    const allUsersCities = [];
    for (let a = 0; a < users.length; a++) {
      const user = users[a];

      const addressData = await Address.findOne({ fkuserId: user._id.toString() });

      if (addressData) {
        const details = addressData.currentAddress.details;

        for (let b = 0; b < details.length; b++) {
          const currentCity = details[b].city;
          allUsersCities.push({ userId: user._id, name: user.name, city: currentCity });
        }
      }
    }

    return res.json({ cities: allUsersCities });
  } catch (error) {
    console.error(error);
    res.json({ error: 'Internal Server Error' });
  }
});

router.get('/userCity/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ error: 'User not found' });
    }

    const addressData = await Address.findOne({ fkuserId: userId });

    if (addressData) {
      const details = addressData.currentAddress.details;
      const city = [];

      for (let i = 0; i < details.length; i++) {
        city.push(details[i].city);
      }
    
      return res.json({ userId: userId, name: user.name, city: city });
    } else {
      return res.json({ error: 'Address details not found' });
    }
  } catch (error) {
    console.error(error);
    res.json({ error: 'Internal Server Error' });
  }
});

router.get('/searchLandmark/:landmarkName', async (req, res) => {
  try {
    const landmarkName = req.params.landmarkName;

    const allAddresses = await Address.find();

    const matchingLandmarks = allAddresses.filter(address => {
      const permanentLandmarkMatch = address.permanentAddress.landmark.toLowerCase().includes(landmarkName.toLowerCase());
      const currentLandmarkMatch = address.currentAddress.landmark.toLowerCase().includes(landmarkName.toLowerCase());
      return permanentLandmarkMatch || currentLandmarkMatch;
    });

    if (matchingLandmarks.length > 0) {
      const userAddresses = [];
      
      for (const address of matchingLandmarks) {
        const userId = address.fkuserId;
        const user = await User.findById(userId);
        userAddresses.push({
          user: user,
          address: address
        });
      }

      return res.json({ userAddresses: userAddresses });
    } else {
      return res.json({ message: 'No landmarks found!' });
    }
  } catch (error) {
    console.error(error.message, 'Server Error');
    res.json({ error: 'Server Error' });
  }
});

///////////////////////// ----- Order ----- //////////////////////////////

router.post("/addOrder", async (req, res) => {
  const body = req.body
  const { name, price, date } = body;

  const order = new Order({
    orders: [{ name, price, date }],
  });

  try {
    await order.save();

    res.json({ message: 'Order added successfully', order });
  } catch (err) {
    console.error(err);
    res.json({ error: 'Server Error' });
  }
});

router.get("/orderDetails", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.json({ error: 'Server Error' });
  }
});

router.get("/orderDetails/:name", async (req, res) => {
  const orderName = req.params.name;

  try {
    const order = await Order.findOne({ 'orders.name': { $regex: new RegExp(orderName, 'i') } });

    if (!order) {
      return res.json({ error: 'Order not found' });
    }

    res.json({ order });

  } catch (err) {
    console.error(err);
    res.json({ error: 'Server Error' });
  }
});




module.exports = router;
