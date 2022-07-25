const express = require('express')
const router = express.Router()
const {createUser} = require('../controller/controller')



router.post("/register", createUser )
//router.post("/login", )
//router.get(" /user/:userId/profile", )
//router.put("/user/:userId/profile", )



router.all("/*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})




module.exports = router