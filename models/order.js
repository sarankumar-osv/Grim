const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orders: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
