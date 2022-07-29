const userModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const validator = require('../validator/validator')
const jwt = require('jsonwebtoken')
const saltRounds = 10
const { uploadFile } = require('../aws/config')
const { RDS } = require("aws-sdk")

const createUser = async function (req, res) {
    try {
        let userDetail = req.body
        if (Object.keys(userDetail).length == 0)
            return res.status(400).send({ status: false, msg: "Request Body cannot be empty." })

        let { fname, lname, email, phone, password, address } = userDetail
        let file = req.files
        if (!address || address == '') return res.status(400).send({status : false, message: "Please give full address of user" })
           
        address = JSON.parse(address)
        let { shipping, billing } = address
        let obj = {}



        if (!validator.isValidBody(fname)) { return res.status(400).send({ status: false, msg: 'Please enter fname' }) }
        if (!validator.isValidBody(lname)) { return res.status(400).send({ status: false, msg: 'Please enter lname' }) }

        if (!validator.isValidName(fname)) { return res.status(400).send({ status: false, msg: 'fname should be in Alphabets' }) }
        if (!validator.isValidName(lname)) { return res.status(400).send({ status: false, msg: 'lname should be in Alphabets' }) }

        if (!validator.isValidBody(email)) { return res.status(400).send({ status: false, msg: 'Please enter the Email Id' }) }
        if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, msg: 'Please enter valid emailId' }) }

        //profileImage
        if (!validator.isValidBody(phone)) { return res.status(400).send({ status: false, msg: 'Please enter the Mobile Number' }) }
        if (!validator.isValidMobileNumber(phone)) { return res.status(400).send({ status: false, msg: 'Please enter valid Mobile Number' }) }
        if (!validator.isValidBody(password)) { return res.status(400).send({ status: false, msg: 'Please enter the password' }) }
        // to validate the password in given length
        if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, msg: "password should be have minimum 8 character and max 15 character" }) }

        if (file.length == 0) return res.status(400).send({ status: false, msg: "File is Missing" })

       

        

             //Validation of Shipping Address
            if (!validator.isValidBody(shipping.street)) { return res.status(400).send({ status: false, msg: 'Please enter Shipping street' }) }
            if (!validator.isValidBody(shipping.city)) { return res.status(400).send({ status: false, msg: 'Please enter Shipping city' }) }
            if (!validator.isValidCity(shipping.city)) { return res.status(400).send({ status: false, msg: 'Invalid Shipping city' }) }
            if (!validator.isValidBody(shipping.pincode)) { return res.status(400).send({ status: false, msg: 'Please enter Shipping pin' }) }
            if (!validator.isValidPin(shipping.pincode)) { return res.status(400).send({ status: false, msg: 'Invalid Shipping Pin Code.' }) }

            //Validation of Billing Address
            if (!validator.isValidBody(billing.street)) { return res.status(400).send({ status: false, msg: 'Please enter billing street' }) }
            if (!validator.isValidBody(billing.city)) { return res.status(400).send({ status: false, msg: 'Please enter billing city' }) }
            if (!validator.isValidCity(billing.city)) { return res.status(400).send({ status: false, msg: 'Invalid billing city' }) }
            if (!validator.isValidBody(billing.pincode)) { return res.status(400).send({ status: false, msg: 'Please enter billing pin' }) }
            if (!validator.isValidPin(billing.pincode)) { return res.status(400).send({ status: false, msg: 'Invalid billing Pin Code.' }) }




        if (file && file.length > 0) var uploadUrl = await uploadFile(file[0])


        password = await bcrypt.hash(password, saltRounds)



        const isDuplicateNumber = await userModel.find({ phone: phone })
        if (isDuplicateNumber.length != 0) { return res.status(400).send({ status: false, msg: 'This number is already exist' }) }

        const isDuplicateEmail = await userModel.find({ email: email })
        if (isDuplicateEmail.length != 0) { return res.status(400).send({ status: false, msg: 'This mailId is already exist' }) }

        obj = {
            fname: fname,
            lname: lname,
            email: email,
            phone: phone,
            password: password,
            profileImage: uploadUrl
        }

        obj["address.billing.street"] = billing.street
        obj["address.billing.city"] = billing.city
        obj["address.billing.pincode"] = billing.pincode
        obj["address.shipping.street"] = shipping.street
        obj["address.shipping.city"] = shipping.city
        obj["address.shipping.pincode"] = shipping.pincode


        let savedUser = await userModel.create(obj)
        return res.status(201).send({
            status: true,
            msg: "User created successfully",
            Data: savedUser
        })
    }
    catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message
        })
    }
}


// if (!Validator.isValidBody(title)) { return res.status(400).send({ status: false, msg: 'Please enter the title' }) }
//         // to validate the enum 
// if (["Mr", "Mrs", "Miss"].indexOf(title) == -1) { return res.status(400).send({ status: false, msg: 'Please select the title in Mr Mrs & Miss' }) }


const createLogin = async function (req, res) {
    const requestbody = req.body
    const { email, password } = requestbody

    if (!validator.isValidBody(email)) { return res.status(400).send({ status: false, msg: 'Please enter the Email Id' }) }
    if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, msg: 'Please enter valid emailId' }) }

    if (!validator.isValidBody(password)) { return res.status(400).send({ status: false, msg: 'Please enter the password' }) }
    if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, msg: "password should be have minimum 8 character and max 15 character" }) }

    const user = await userModel.findOne({ email: email })
    if (!user) { return res.status(400).send({ status: false, msg: 'No such user found' }) }

    let result = await bcrypt.compare(password, user.password)

    if (result) {

        var token = jwt.sign({
            userId: user._id.toString(),
            project: "Project-5",
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60
        }, "Project-5 product Management ");

        return res.status(200).send({
            status: true,
            message: 'User login successfull',
            data: {
                userId: user._id,
                token: token

            }
        })
    } else {
        return res.status(400).send({
            status: true,
            message: 'Wrong Password'
        })
    }

}



const getUser = async function (req, res) {
    try {

        let userId = req.params.userId

        let findUser = await userModel.findOne({ _id: userId })
        console.log(findUser)
        if (!findUser) return res.status(402).send({ status: false, msg: "Please enter valid userId" })
        return res.status(200).send({ status: false, msg: "User profile details", data: findUser })
    }
    catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message
        })
    }
}


const updateUser = async function (req, res) {
    let { fname, lname, email, phone, password, address } = req.body
    let file = req.files
    let id = req.userId

    let obj = {}

    if (fname) obj.fname = fname
    if (lname) obj.lname = lname
    if (email) obj.lname = lname
    if (phone) obj.lname = lname
    if (password) password = await bcrypt.hash(password, saltRounds)

    if (file && file.length > 0) {
        let uploadUrl = await uploadFile(file[0])
        obj.profileImage = uploadUrl

    }

    if(address){

        let { shipping, billing } = address
        if (shipping) {
            if (shipping.street) obj["address.shipping.street"] = shipping.street
            if (shipping.city) {
                if (!validator.isValidPin(shipping.pincode)) { return res.status(400).send({ status: false, msg: 'Invalid Shipping Pincode.' }) }
                obj["address.shipping.city"] = shipping.city
            }
            if (shipping.pincode) {
                if (!validator.isValidPin(billing.pincode)) { return res.status(400).send({ status: false, msg: 'Invalid billing Pincode.' }) }
                obj["address.shipping.pincode"] = shipping.pincode
            }
        }
    
        if (billing) {
            if (billing.street) obj["address.billing.street"] = billing.street
            if (billing.city) {
                if (!validator.isValidCity(billing.city)) { return res.status(400).send({ status: false, msg: 'Invalid billing city' }) }
                obj["address.billing.city"] = billing.city
            }
            if (billing.pincode) {
                if (!validator.isValidPin(billing.pincode)) { return res.status(400).send({ status: false, msg: 'Invalid billing Pin Code.' }) }
                obj["address.billing.pincode"] = billing.pincode
            }
        }
    
    
    }

   
    let updatedUser = await userModel.findOneAndUpdate(
        { _id: id },
        obj,
        { new: true }
    )

    return res.status(200).send({ status: true, data: updatedUser })
}


module.exports = {
    createUser,
    createLogin,
    getUser,
    updateUser
}


//Need to change msg to message