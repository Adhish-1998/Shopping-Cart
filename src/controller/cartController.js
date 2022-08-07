const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const { isValidObjectId, isValidBody } = require('../validator/validator')

const createCart = async (req, res) => {
    if (Object.keys(req.body).length == 0)
        return res.status(400).send({ status: false, message: "Request Body cannot be empty." })

    let { cartId, productId, quantity } = req.body
    let userId = req.params.userId

    if (!quantity) quantity = 1
    if (!isValidBody(productId)) return res.status(400).send({ status: false, message: "Enter Product Id." })
    if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Enter Valid Product Id." })


    let prc = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!prc) return res.status(404).send({ status: false, message: "Product Not Found." })
    let price = prc.price

    let obj = {}

    if (cartId) {

        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Enter Valid Cart Id." })
        let cartExist = await cartModel.findOne({ _id: cartId }).select({ _id: 0, items: 1, totalPrice: 1, totalItems: 1 })
        if (cartExist) {

            var arr = cartExist.items
            for (let i in arr) {
                if (arr[i].productId.toString() == productId) {

                    arr[i].quantity = arr[i].quantity + quantity
                    var tPrice = cartExist.totalPrice + (quantity * price)
                    var tItems = arr.length
                    let cc = await cartModel.findOneAndUpdate({ _id: cartId }, { items: arr, totalPrice: tPrice, totalItems: tItems }, { new: true }).populate("items.productId")
                    return res.status(201).send({ status : true, message: "Success", data: cc })
                }

            }

            tPrice = 0
            arr.push({ productId: productId, quantity: quantity })
            tPrice = cartExist.totalPrice + (quantity * price)
            obj.items = arr
            obj.totalPrice = tPrice
            obj.totalItems = arr.length
            var newPro = await cartModel.findOneAndUpdate({ _id: cartId }, obj, { new: true })
            return res.status(201).send({ status: true, message: "Success", data: newPro })

        } else return res.status(404).send({ status: false, message: "Cart Not Exist." })



    } else {

        let cartExist = await cartModel.findOne({ userId: userId })
        if (!cartExist) {

            let arr1 = []
            var totalPrc = quantity * price

            arr1.push({ productId: productId, quantity: quantity })

            obj = {
                userId: userId,
                items: arr1,
                totalItems: arr1.length,
                totalPrice: totalPrc,
            }

            let cart = await cartModel.create(obj)
            return res.status(201).send({ status: true, message: "Success", data: cart })

        } else return res.status(400).send({ status: true, message: "Enter CartId Please!!" })


    }


}


const getCart = async function (req, res) {
    try {

        let findCart = await cartModel.findOne({ userId: req.params.userId }).populate("items.productId")
        if (!findCart) {
            return res.status(400).send({ status: false, message: "Cart does not exist" })
        }

        res.status(200).send({ status: true, message: "Success", data: findCart })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}



const updateCart = async (req, res) => {
    let { removeProduct, cartId, productId } = req.body

    if (removeProduct != 1 && removeProduct != 0) return res.status(400).send({ status: false, message: "Value of Removed Product Must be 0 or 1." })

    if (!cartId) return res.status(400).send({ status: false, message: "Please Enter Cart Id" })
    if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Please Enter Valid Cart Id" })


    if (!productId) return res.status(400).send({ status: false, message: "Please Enter productId" })
    if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Please Enter Valid productId" })


    let product = await productModel.findOne({ _id: productId, isDeleted: false })
    let cart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })

    if (!cart) return res.status(404).send({ status: false, message: "Product Already Removed From Cart." })

    let totalAmount = cart.totalPrice - product.price;
    let arr = cart.items;
    let totalItems = cart.totalItems


    if (removeProduct == 1) {
        for (i in arr) {

            if (arr[i].productId.toString() == productId) {

                arr[i].quantity = arr[i].quantity - 1;
              
                if (arr[i].quantity < 1) {
                    totalItems--
                    let cd = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } },totalItems : totalItems }, { new: true });
                    arr = cd.items
                    totalItems = cd.totalItems
                }

            }
        }

        let datas = await cartModel.findOneAndUpdate({ _id: cartId }, { items: arr, totalPrice: totalAmount, totalItems: totalItems }, { new: true });
        return res.status(200).send({ status: true, message: 'Success', data: datas });
    }
    if (removeProduct == 0) {

        let tItems = cart.totalItems - 1
        for (i in arr) {

            let tPrice = cart.totalPrice - (arr[i].quantity * product.price)
            if (arr[i].productId.toString() == productId) {
                let data = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: tPrice, totalItems: tItems }, { new: true });
                return res.status(200).send({ status: true, message: 'Success', data : data});

            }
        }

    }

}


const deleteCart = async (req, res) => {
    try {

        let checkCart = await cartModel.findOne({ userId: req.params.userId })
        if (!checkCart) return res.status(404).send({ status: false, message: "Cart does Not Exist With This User" })

        await cartModel.findOneAndUpdate({ userId: req.params.userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })

        return res.status(204).send()
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