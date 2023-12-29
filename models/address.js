const mongoose = require ("mongoose");

const addressSchema = mongoose.Schema({

    permanentAddress: {
        street: String,
        details: [{
          city: String,
          state: String,
          postalcode: Number
        }],
        landmark: String
      },
      currentAddress: {
        street: String,
        details: [{
          city: String,
          state: String,
          postalcode: Number
        }],
        landmark: String
      },
      fkuserId:{
        type: String,
        required: true
      }
});

const Address = new mongoose.model("address", addressSchema);

module.exports = Address;