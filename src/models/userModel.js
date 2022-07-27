const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    profileImage: {
        type: String,
        required: true,
        trim: true,
        default: null
    }, // s3 link
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }, // valid Indian mobile number}, 
    password: {
        type: String,
        required: true,
        minLen: 8,
        maxLen: 15,
        trim: true
    }, // encrypted password
    address: {
        shipping: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            pincode: { type: Number, required: true, trim: true }
        },
        billing: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            pincode: { type: Number, required: true, trim: true, minLen: 6 }
        }
    },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)