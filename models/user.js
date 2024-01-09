const mongoose = require('mongoose');

const connect = mongoose.connect(process.env.MONGO_URL);

connect.then(()=>{
    console.log('Connected to Dadabase...');
})
.catch((err)=>{
    console.log('Failed to Connect Database...');
    console.log(err.message)
})

const Loginschema = new mongoose.Schema({

    userName: {
        type: String,
        required:true
    },
    name: {
        type:String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true
    },
    age: {
        type: Number,
        min: 1,
        max: 120,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    token: {
        type: String
    },
    otp: {
        type: String,
        required: false
      },

});

  

module.exports = mongoose.model('users', Loginschema)
