const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const validator = require('../validator/validator')
//const mongoose = require('mongoose')
//const ObjectId = mongoose.Types.ObjectId;

const createCart = async (req, res) => {

    let { items, cartId, productId, quantity } = req.body
    let userId = req.params.userId
   // let prod = productId.productId

    //let prod = items[0].productId

    let prc = await productModel.findOne({ _id: productId })//.select({ _id: 0, price: 1 }) //.select({ price: 1 })//
    console.log(productId)
    let price = prc.price
    // items = JSON.parse(items)
    let obj = {}
    if (cartId) {
        let cartExist = await cartModel.findOne({ _id: cartId }).select({ _id: 0, items: 1, totalPrice: 1, totalItems: 1 })
        // let quant1 = 
        if (cartExist) {

            let arr = cartExist.items
            for (let i in arr) {
                if (arr[i].productId.toString() == productId) {

                    arr[i].quantity = arr[i].quantity + quantity
                    var tPrice = cartExist.totalPrice + (quantity * price)
                    var tItems = arr.length
                    let cc = await cartModel.findOneAndUpdate({ _id: cartId }, { items: arr, totalPrice: tPrice, totalItems: tItems }, { new: true })
                    return res.send({ data: cc })
                }

                //return res.send("hi")
            }
            console.log(cartExist.totalItems)
            tPrice = 0
            arr.push({ productId: productId , quantity: quantity })
            tPrice = cartExist.totalPrice + (quantity * price)
            obj.items = arr
            obj.totalPrice = tPrice
            obj.totalItems = arr.length
            var newPro = await cartModel.findOneAndUpdate({ _id: cartId }, obj, { new: true })
            return res.send({ data: newPro })

        }else {
            return res.status(404).send({status:false, message : "Cart Not Exist."})
        }


       
    } else {
        let cartExist = await cartModel.findOne({ userId: userId })
        //
        if (cartExist) return res.status(200).send({ status: true, message: "Enter CartId Please!!" })

        for (let i in items) {

            //let { productId, quantity } = items[i]
            // return res.send({data: productId})
            let product = await productModel.findOne({ _id: productId }).select({ price: 1 })
            let price = product.price
            var totalPrice = quantity * price
            items[i].productId = productId
            items[i].quantity = quantity

            //console.log(items[i])
        }
        obj = {
            userId: userId,
            items: items,
            totalPrice: totalPrice,
            totalItems: items.length,
        }

        let cart = await cartModel.create(obj)//.select({_id: 0})
        return res.status(201).send({ status: true, message: "Successful", data: cart })
    }


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

    let totalAmount = cart.totalPrice - product.price;
    let arr = cart.items;
    console.log(removeProduct)

    if (removeProduct == 1) {
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
    if (removeProduct == 0) {
        let tItems = cart.totalItems - 1
        for (i in arr) {
            let tPrice = cart.totalPrice - (arr[i].quantity * product.price)
            if (arr[i].productId.toString() == productId) {
                let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: tPrice, totalItems: tItems }, { new: true });
                return res.status(200).send({ status: true, message: `${productId} is removed`, data: data });

            }
        }

    }





    // console.log(isProductinCart)
    // let totalAmount = cart.totalPrice - product.price;
    // let arr = cart.items;
    //console.log(arr)

    //* decrement quantity

    return res.send("Hi")

}


const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        // let tokenId = req['userId']

        // if (!(validator.isValidBody(userId))) {
        //     return res.status(400).send({ status: false, message: "Please Provide User Id" })
        // }

        // if (!(validator.isValidObjectId(userId))) {
        //     return res.status(400).send({ status: false, message: "This is not a Valid User Id" })
        // }

        // let checkUser = await userModel.findOne({ _id: userId })

        // if (!checkUser) {
        //     return res.status(404).send({ status: false, message: "This User is Not Exist" })
        // }

        // if (!(userId == tokenId)) {
        //     return res.status(401).send({ status: false, message: "Unauthorized User" })
        // }

        let checkCart = await cartModel.findOne({ userId: userId })

        if (!checkCart) {
            return res.status(404).send({ status: false, message: "Cart does Not Exist With This User" })
        }
        //let arr = []
        await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })

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