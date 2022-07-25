const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

let token
const authenticate = function (req, res, next) {

    try {
        token = req.headers['x-api-key']
        if (!token) res.status(400).send({ status: false, msg: "Please enter token" })
        let validtoken = jwt.verify(token, "Project-5 product Management ")
        if (!validtoken) return res.status(402).send({ status: false, msg: "Please enter valid Token " })
        req.dtoken = validtoken
    } catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message,
        })
    }
    next()
}

const authorise = async function (req, res, next) {

    try {
        // to decode the token 
        let decodedtoken = jwt.verify(token, "Project-5 project Management ")
        if (!decodedtoken) return res.status(402).send({ status: false, msg: "Please enter valid Token " })

        // to take the bookUser
        let userId = req.params.userId
        if (userId === ":userId") return res.status(400).send({ status: false, msg: "Please enter userId" })
        if (decodedtoken.userId == userId) {
            let findUser = await userModel.findOne({ _id: userId })
            if (!findUser) return res.status(402).send({ status: false, msg: "Please enter valid userId" })
        } else {
            return res.status(400).send({
                status: false,
                msg: "invalid login credentials"
            })
        }
    } catch (err) {
        res.status(500).send({
            status: false,
            msg: err.message,
        })
    }
    next()
}
module.exports = { authenticate, authorise }


        // // to find userid from decoded token
        // let userAuth = decodedtoken.userId
        // // to check userid and decoded user is same or not 
        // if (userAuth != findUser._id) return res.status(404).send({ status: false, msg: "Please login with your mail id " })