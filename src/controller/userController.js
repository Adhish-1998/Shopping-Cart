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
            return res.status(400).send({ status: false, message: "Request Body cannot be empty." })

        let { fname, lname, email, phone, password, address } = userDetail
        let file = req.files
        if (!address || address == '') return res.status(400).send({ status: false, message: "Please give the address of user" })

        address = JSON.parse(address)
        let { shipping, billing } = address
        let obj = {}



        if (!validator.isValidBody(fname)) { return res.status(400).send({ status: false, message: 'Please enter fname' }) }
        else fname = fname.trim().split(" ").filter((word) => word).join('')

        if (!validator.isValidBody(lname)) { return res.status(400).send({ status: false, message: 'Please enter lname' }) }
        else lname = lname.trim().split(" ").filter((word) => word).join('')

        if (!validator.isValidName(fname)) { return res.status(400).send({ status: false, message: 'fname should be in Alphabets' }) }
        if (!validator.isValidName(lname)) { return res.status(400).send({ status: false, message: 'lname should be in Alphabets' }) }

        if (!validator.isValidBody(email)) { return res.status(400).send({ status: false, message: 'Please enter the Email Id' }) }
        if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, message: 'Please enter valid emailId' }) }

        //profileImage
        if (!validator.isValidBody(phone)) { return res.status(400).send({ status: false, message: 'Please enter the Mobile Number' }) }
        if (!validator.isValidMobileNumber(phone)) { return res.status(400).send({ status: false, message: 'Please enter valid Mobile Number' }) }
        if (!validator.isValidBody(password)) { return res.status(400).send({ status: false, message: 'Please enter the password' }) }
        // to validate the password in given length
        if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, message: "password should be have minimum 8 character and max 15 character" }) }

        if (file.length == 0) return res.status(400).send({ status: false, message: "File is Missing" })




        //------------------------Validation of Shipping Address------------------------//
        if (!shipping) return res.status(400).send({ status: false, message: "Enter Shipping Address." })

        if (!validator.isValidBody(shipping.street)) { return res.status(400).send({ status: false, message: 'Please enter Shipping street' }) }

        if (!validator.isValidBody(shipping.city)) { return res.status(400).send({ status: false, message: 'Please enter Shipping city' }) }
        else shipping.city = shipping.city.trim().split(" ").filter((word) => word).join('')

        if (!validator.isValidCity(shipping.city)) { return res.status(400).send({ status: false, message: 'Invalid Shipping city' }) }

        if (!validator.isValidBody(shipping.pincode)) { return res.status(400).send({ status: false, message: 'Please enter Shipping pin' }) }
        if (!validator.isValidPin(shipping.pincode)) { return res.status(400).send({ status: false, message: 'Invalid Shipping Pin Code.' }) }


        //------------------------Validation of Billing Address------------------------//
        if (!billing) return res.status(400).send({ status: false, message: "Enter Billing Address." })

        if (!validator.isValidBody(billing.street)) { return res.status(400).send({ status: false, message: 'Please enter billing street' }) }

        if (!validator.isValidBody(billing.city)) { return res.status(400).send({ status: false, message: 'Please enter billing city' }) }
        else billing.city = billing.city.trim().split(" ").filter((word) => word).join('')

        if (!validator.isValidCity(billing.city)) { return res.status(400).send({ status: false, message: 'Invalid billing city' }) }

        if (!validator.isValidBody(billing.pincode)) { return res.status(400).send({ status: false, message: 'Please enter billing pin' }) }
        if (!validator.isValidPin(billing.pincode)) { return res.status(400).send({ status: false, message: 'Invalid billing Pin Code.' }) }




        if (file && file.length > 0) {
            if (file.length >1) return res.status(400).send({status : false, message : "More than One file cannot be uploaded"})
            var uploadUrl = await uploadFile(file[0])
        }
        


        password = await bcrypt.hash(password, saltRounds)



        const isDuplicateNumber = await userModel.find({ phone: phone })
        if (isDuplicateNumber.length != 0) { return res.status(400).send({ status: false, message: 'This number is already exist' }) }

        const isDuplicateEmail = await userModel.find({ email: email })
        if (isDuplicateEmail.length != 0) { return res.status(400).send({ status: false, message: 'This mailId is already exist' }) }

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
            message: "User created successfully",
            data: savedUser
        })
    }
    catch (err) {
        res.status(500).send({
            status: false,
            message: err.message
        })
    }
}





const createLogin = async function (req, res) {

    if (Object.keys(req.body).length == 0)
        return res.status(400).send({ status: false, message: "Enter Login Credentials." })

    const requestbody = req.body
    const { email, password } = requestbody

    if (!validator.isValidBody(email)) { return res.status(400).send({ status: false, message: 'Please enter the Email Id' }) }
    if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, message: 'Please enter valid emailId' }) }

    if (!validator.isValidBody(password)) { return res.status(400).send({ status: false, message: 'Please enter the password' }) }
    if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, message: "password should be have minimum 8 character and max 15 character" }) }

    const user = await userModel.findOne({ email: email })
    if (!user) { return res.status(400).send({ status: false, message: 'No such user found' }) }

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
            status: false,
            message: 'Wrong Password'
        })
    }

}



const getUser = async function (req, res) {
    try {

        let userId = req.params.userId
        if (userId === ":userId") return res.status(400).send({ status: false, message: "Please enter userId" })
        if (!validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please Enter Valid UserId." })
        let findUser = await userModel.findOne({ _id: userId })
        if (!findUser) return res.status(404).send({ status: false, message: "User Not Found" })
        return res.status(200).send({ status: true, message: "User profile details", data: findUser })
    }
    catch (err) {
        res.status(500).send({
            status: false,
            message: err.message
        })
    }
}


const updateUser = async function (req, res) {
    if (Object.keys(req.body).length == 0)
        return res.status(400).send({ status: false, message: "Atleast one field required for update." })
    let { fname, lname, email, phone, password, address } = req.body
    let file = req.files
    let id = req.userId

    let obj = {}

    if (fname) {
        fname = fname.trim().split(" ").filter((word) => word).join('')
        if (!validator.isValidName(fname)) { return res.status(400).send({ status: false, message: 'fname should be in Alphabets' }) }
        obj.fname = fname
    }

    if (lname) {
        lname = lname.trim().split(" ").filter((word) => word).join('')
        if (!validator.isValidName(lname)) { return res.status(400).send({ status: false, message: 'lname should be in Alphabets' }) }
        obj.lname = lname
    }
    if (email) {
        if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, message: 'Please enter valid emailId' }) }
        obj.email = email
    }
    if (phone) {
        if (!validator.isValidMobileNumber(phone)) { return res.status(400).send({ status: false, message: 'Please enter valid Mobile Number' }) }
        obj.phone = phone
    }

    if (password) {
        if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, message: "password should be have minimum 8 character and max 15 character" }) }
        password = await bcrypt.hash(password, saltRounds)
    }

    if (file && file.length > 0) {
        if (file.length >1) return res.status(400).send({status : false, message : "More than One file cannot be uploaded"})
        var uploadUrl = await uploadFile(file[0])
        obj.profileImage = uploadUrl
    }


    if (address) {

        let { shipping, billing } = address
        if (shipping) {
            if (shipping.street) obj["address.shipping.street"] = shipping.street
            if (shipping.city) {
                shipping.city = shipping.city.trim().split(" ").filter((word) => word).join('')
                if (!validator.isValidCity(shipping.city)) { return res.status(400).send({ status: false, message: 'Invalid Shipping Pincode.' }) }
                obj["address.shipping.city"] = shipping.city
            }
            if (shipping.pincode) {
                if (!validator.isValidPin(billing.pincode)) { return res.status(400).send({ status: false, message: 'Invalid billing Pincode.' }) }
                obj["address.shipping.pincode"] = shipping.pincode
            }
        }

        if (billing) {
            if (billing.street) obj["address.billing.street"] = billing.street
            if (billing.city) {
                billing.city = billing.city.trim().split(" ").filter((word) => word).join('')
                if (!validator.isValidCity(billing.city)) { return res.status(400).send({ status: false, message: 'Invalid billing city' }) }
                obj["address.billing.city"] = billing.city
            }
            if (billing.pincode) {
                if (!validator.isValidPin(billing.pincode)) { return res.status(400).send({ status: false, message: 'Invalid billing Pin Code.' }) }
                obj["address.billing.pincode"] = billing.pincode
            }
        }


    }


    let updatedUser = await userModel.findOneAndUpdate(
        { _id: id },
        obj,
        { new: true }
    )

    return res.status(200).send({ status: true, message: "Success", data: updatedUser })
}


module.exports = {
    createUser,
    createLogin,
    getUser,
    updateUser
}
