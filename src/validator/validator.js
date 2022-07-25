const validator = require('validator')
const mongoose = require('mongoose')
const passwordValidator = require('password-validator');
const ObjectId = mongoose.Types.ObjectId;


// const isvalidRequestBody = function (value) {
//     return Object.keys(value).length > 0
// }

const isValidBody = function (value) {
    if (typeof value === 'undefined' || value === 'null') return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidMobileNumber = function (mobile) {
    let checkMobile = /^[6-9]\d{9}$/
    if (checkMobile.test(mobile)) {
        return true;
    }
    return false;
}
const isValidEmail = function (email) {
    let checkemail = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    if (checkemail.test(email)) {
        return true;
    }
    return false;
}
const isValidObjectId = function (userId) {
    return mongoose.isValidObjectId(userId)
}

const isValidpassword = function (password) {

    let checkPassword = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/
    if (checkPassword.test(password)) {
        return true
    }
    return false
}

module.exports = {
    isValidBody,
    isValidMobileNumber,
    isValidEmail,
    isValidObjectId,
    isValidpassword,
}