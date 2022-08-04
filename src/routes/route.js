const express = require('express')
const router = express.Router()
const {authenticate, authorise } = require('../middleware/auth')
const {createUser, createLogin, getUser, updateUser} = require('../controller/userController')
const {createProduct, getProduct, getProductById, updateProduct, deleteById} = require('../controller/productController')
const {createCart, getCart, updateCart, deleteCart} = require('../controller/cartController')
const {createOrder,updateOrder} = require('../controller/orderController')

//-------------For USER------------------//
router.post("/register", createUser )
router.post("/login", createLogin )
router.get("/user/:userId/profile", authenticate, authorise, getUser )
router.put("/user/:userId/profile", authenticate, authorise, updateUser )

//-------------For Product-------------//
router.post("/products", createProduct )
router.get("/products", getProduct)
router.get("/products/:productId", getProductById)
router.put("/products/:productId", updateProduct)
router.delete("/products/:productId", deleteById)

//-------For Cart----------//
router.post("/users/:userId/cart", authenticate, authorise, createCart )
router.get("/users/:userId/cart", authenticate, authorise, getCart )
router.put("/users/:userId/cart", authenticate, authorise, updateCart )
router.delete("/users/:userId/cart", authenticate, authorise, deleteCart )

//-------For Cart----------//
router.post("/users/:userId/orders", createOrder)
router.put("/users/:userId/orders", updateOrder)

router.all("/*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})




module.exports = router