const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const router = express.Router();
const Contact = require('../models/contact');
const authFile = require('../middleware/auth');
router.use(express.json());

router.use(express.urlencoded({extended: false }));
router.use(bodyParser.json());

router.post('/submit-form', authFile.validateToken, async (req, res) => {
    try {
      const contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
      });
  
      const savedContact = await contact.save();

      const transPorter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: 'verifyuserofficial@gmail.com',
            pass: 'wsdv megz vecp wzen'
        },
      });
  
      await transPorter.sendMail({
        from: 'verifyuserofficial@gmail.com',
        to: contact.email,
        subject: 'Thank you for contacting us', 
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting us</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              background-color: #f8f9fa;
              color: #333;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
              color: #007bff;
            }
            p {
              margin-bottom: 10px;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #888;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Thank you for contacting us!</h1>
            <p>Dear ${contact.name},</p>
            <p>We have received your message and will get back to you soon.</p>
            <p>If you have any further questions or need assistance, feel free to contact us.</p>
            <p>Best regards,<br>Sarankumar</p>
            <div class="footer">
              This is an automated message. Please do not reply to this email.
            </div>
          </div>
        </body>
        </html>
      `
      });
        
      res.send('<script>alert("Message Send Succesfull"); window.location.href = "/";</script>');
    } catch (err) {
      console.log(err.message);
      res.send('Internal Server Error');
    }
  });

module.exports = router;
