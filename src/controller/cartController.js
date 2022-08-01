const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validator = require('../validator/validator')
//const mongoose = require('mongoose')
//const ObjectId = mongoose.Types.ObjectId;

const createCart = async (req, res) => {

    let { items } = req.body
    let userId = req.params
    items = JSON.parse(items)
    let obj = {}
    console.log()
    for(let i in items){

        let { productId, quantity } = items[i]
        let product = await productModel.findOne({ _id: productId }).select({ price: 1 })
        let price = product.price
        var totalPrice = quantity * price
        //console.log(items[i])
        

    }
    obj.items = items
    console.log(obj)
    
    //let quantity = items[0].quantity
    //console.log(productId, quantity)
    

    // console.log(product.price)
    // console.log(product.price)
   
    //console.log(totalPrice)
    obj = {
        userId: userId.userId,
        totalPrice: totalPrice,
        totalItems: items.length,
    }
//     //items[0].prodcutId = productId.prodcutId
//    // items[0].quantity = quantity
//     obj.items = items
//     //obj.items[0].quantity = quantity.quantity
//     //obj["items.quantity"] = quantity
//     console.log(obj)
    // user = await userModel.findOne({_id: userId})
    // if(!user) return res.status(404).send({status: false, message: "User Does Not Exist."})
    let cart = await cartModel.create(obj)//.select({_id: 0})
    return res.status(201).send({ status: true, message: "Successful", data: cart })
    return res.send("Hi")
}


const getCart = async function (req, res) {
    try {

        let userId = req.params.userId

        // if(req.user.userId!= userId){
        //     return res.status(401).send({status: false, message:"Invalid userId provided"})

        //     }
        // if(!validObject(userId)){
        //     return res.status(400).send({status: false, message: "userId is invalid"})
        // }
        // let findUser = await userModel.findOne({_id: userId})
        // if(!findUser){
        //     return res.status(400).send({status: false, message: "User does not exist"})
        // }
        let findCart = await cartModel.findOne({ userId: userId }).select({ items: 1, _id: 0 })//.populate('productId')
        if (!findCart) {
            return res.status(400).send({ status: false, message: "Cart does not exist" })
        }
        res.status(200).send({ status: true, data: findCart })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const updateCart = async (req, res) => {
    let { removeProduct, cartId, productId } = req.body

    //console.log(req.body)
    //let id = req.params.userId
    //console.log(productId)
    let product = await productModel.findOne({ _id: productId })
    let cart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })
    // console.log(isProductinCart)
    // let totalAmount = cart.totalPrice - product.price;
    // let arr = cart.items;
    //console.log(arr)

    //* decrement quantity

    let totalAmount = cart.totalPrice - product.price;
    let arr = cart.items;
    for (i in arr) {
        if (arr[i].productId.toString() == productId) {
            arr[i].quantity = arr[i].quantity - 1;
            if (arr[i].quantity < 1) {
                await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } } }, { new: true });

                let quantity = cart.totalItems - 1;
                let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true });
                return res.status(400).send({ status: false, message: "no such Quantity present in this cart", data: data });
            }
        }
    }
    let datas = await cartModel.findOneAndUpdate({ _id: cartId }, { items: arr, totalPrice: totalAmount }, { new: true });
    return res.status(200).send({ status: true, message: `${productId} quantity is been reduced By 1`, data: datas });
    
}


const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        // let tokenId = req['userId']

        if (!(validator.isValidBody(userId))) {
            return res.status(400).send({ status: false, message: "Please Provide User Id" })
        }

        if (!(validator.isValidObjectId(userId))) {
            return res.status(400).send({ status: false, message: "This is not a Valid User Id" })
        }

        let checkUser = await userModel.findOne({ _id: userId })

        if (!checkUser) {
            return res.status(404).send({ status: false, message: "This User is Not Exist" })
        }

        // if (!(userId == tokenId)) {
        //     return res.status(401).send({ status: false, message: "Unauthorized User" })
        // }

        let checkCart = await cartModel.findOne({ userId: userId })

        if (!checkCart) {
            return res.status(404).send({ status: false, message: "Cart does Not Exist With This User" })
        }

        let delCart = await cartModel.findOneAndUpdate({ userId: userId }, { new: true })

        return res.status(200).send({ status: true, message: "Cart Successfully Deleted" })
    }

    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};



module.exports = {
    createCart,
    getCart,
    updateCart,
    deleteCart
}