const express = require('express')
const router = express.Router()
const {authenticate, authorise } = require('../middleware/auth')
const {createUser, createLogin, getUser, updateUser} = require('../controller/userController')
const {createProduct, getProduct, getProductById, updateProduct, deleteById} = require('../controller/productController')


//-------------For USER------------------//
router.post("/register", createUser )
router.post("/login", createLogin )
router.get("/user/:userId/profile", authenticate, getUser )
router.put("/user/:userId/profile", authenticate, authorise, updateUser )

//-------------For Product-------------//
router.post("/products", createProduct )
router.get("/products", getProduct)
router.get("/products/:productId", getProductById)
router.put("/products/:productId", updateProduct)
router.delete("/products/:productId", deleteById)


router.all("/*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})




module.exports = router