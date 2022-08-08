const mongoose = require('mongoose')


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
const isValidEmail = function (v) {
    v = v.toLowerCase();
    return /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(v);
  };
  
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

const isValidCity = function (street) {
    let checkStreet = /^[A-za-z]+$/
    if (checkStreet.test(street))
        return true
}

const isValidPin = function (pin) {
    let checkPin = /^[0-9]{6}$/
    if (checkPin.test(pin))
        return true
}


const isValidName = function (name) {
    let checkName = /^[A-Z a-z]+$/
    if (checkName.test(name))
        return true
}

const validProdName = (name) => {
    let checkProdName = /^[A-Za-z]+|[A-Za-z]+\[0-9]+$/
    if(checkProdName.test(name))
      return true
}



const isValidPrice = (price) =>{
    let checkPrice =  /[-+][0-9]+|.[0-9]+$/
    if(price == 0) return false
    if(checkPrice.test(price))
      return true
}






module.exports = {
    isValidBody,
    isValidName,
    isValidMobileNumber,
    isValidEmail,
    isValidObjectId,
    isValidpassword,
    isValidCity,
    isValidPin,
    isValidPrice,
    validProdName
}