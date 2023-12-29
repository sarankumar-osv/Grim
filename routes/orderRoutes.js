// const express = require('express');
// const Order = require('../models/order');

// const router = express.Router();

// // Order 

// router.post('/addOrder', async (req, res) => {
//     const body = req.body;
//     const { name, price } = body;
  
//     const order = new Order({
//       name,
//       price,
//     });
  
//     try {
//       await order.save();
  
//       res.json({ message: 'Order added successfully', order });
//     } catch (err) {
//       console.error(err);
//       res.json({ error: 'Server Error' });
//     }
//   });

//   module.exports = router;