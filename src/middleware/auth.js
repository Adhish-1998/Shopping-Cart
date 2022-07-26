const jwt = require('jsonwebtoken')


let token
let decodedToken
const authenticate = function (req, res, next) {

    try {
        token = req.headers.authorization.slice(7)
        if (!token) res.status(400).send({ status: false, msg: "Please enter token" })
        decodedToken = jwt.verify(token, "Project-5 product Management ")
        if (!decodedToken) return res.status(402).send({ status: false, msg: "Please enter valid Token " })
        req.userId = decodedToken.userId
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
        let userId = req.params.userId
        if (userId === ":userId") return res.status(400).send({ status: false, msg: "Please enter userId" })
        if (decodedToken.userId == userId) {
            return next()
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
