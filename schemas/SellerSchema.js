const mongoose = require("mongoose");
const { stringify } = require("querystring");

const sellerSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstname: {
        type: String,
        // required: true
    },
    lastname: {
        type: String,
        // required: true,
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        // required: true
    },
    gender: {
        type: String,
        // required: true,
        // required: true
    },
    age: {
        type: String,
    },
    verified: {
        type: String,
    },
    otp: {
        type: String,
    }
});


module.exports = mongoose.model('Seller', sellerSchema);