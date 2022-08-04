const jwt = require('jsonwebtoken')
const {isValidObjectId } = require('../validator/validator')
const userModel = require('../models/userModel')

let token
let decodedToken
const authenticate = function (req, res, next) {

    try {
        token = req.headers.authorization.slice(7)
        if (!token) res.status(400).send({ status: false, message: "Please enter token" })
        decodedToken = jwt.verify(token, "Project-5 product Management ", function(err,token){
            if(err){ return null}
              else{
                return token
              }
            })
        if (!decodedToken) return res.status(401).send({ status: false, message: "Please enter valid Token " })
        req.userId = decodedToken.userId
    } catch (err) {
        res.status(500).send({
            status: false,
            message: err.message,
        })
    }
    next()
}

const authorise = async function (req, res, next) {

    try {
        let userId = req.params.userId

        if (userId === ":userId") return res.status(400).send({ status: false, message: "Please enter userId" })
        if(!isValidObjectId(userId)) return res.status(400).send({status : false, message: "Please Enter Valid UserId."})
        let user = await userModel.findById( userId )
        if(!user) return res.status(404).send({status : false, message: "User Does Not Exist"})

        if (decodedToken.userId == userId) 
            return next()
        else {
            return res.status(400).send({
                status: false,
                message: "Given User Id is not matched with login user"
            })
        }
        
    } catch (err) {
        res.status(500).send({
            status: false,
            message: err.message,
        })
    }
    next()
}
module.exports = { authenticate, authorise }
