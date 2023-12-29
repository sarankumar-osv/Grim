const mongoose = require('mongoose');

const connect = mongoose.connect(process.env.MONGO_URL);

connect.then(()=>{
    console.log('Connected to Dadabase...');
})
.catch((err)=>{
    console.log('Failed to Connect Database...');
})


const Loginschema = new mongoose.Schema({

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
    }

});

// module.exports = mongoose.model('users', Loginschema)

const collection = new mongoose.model("users", Loginschema);

module.exports = collection;