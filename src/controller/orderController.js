const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const orderModel = require('../models/orderModel') 
const { findOne } = require('../models/cartModel')
const { isValidObjectId, isValidBody } = require('../validator/validator')


const createOrder = async (req,res) =>{
    let {cartId, cancellable} = req.body
    
    if(!isValidBody(cartId)) return res.status(400).send({status: false, message: "Enter Cart Id."})
    if(!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Enter Valid Cart Id." })

    if(cancellable){
        if(!isValidBody(cancellable)) return res.status(400).send({status: false, message: "Enter The value of Cancellabe."})
        if( cancellable != true || cancellable != false ) return res.status(400).send({status:false, message: 'Enter true or false for Cancellable'})
    }

    let  obj={}
    let quantity = 0
    obj.userId = req.params.userId                                      

    let cart = await cartModel.findOne({_id: cartId})
    if(!cart) return res.status(404).send({status:false, message: "Cart Does not Exist."})

    obj.items = cart.items
    obj.totalPrice = cart.totalPrice
    obj.totalItems = cart.totalItems
    
    for(i in cart.items){
        quantity = quantity + cart.items[i].quantity
    }
    obj.totalQuantity = quantity

    await cartModel.findOneAndUpdate({_id: cartId}, {items : [], totalItems: 0, totalPrice : 0})
    let savedOrder = await orderModel.create(obj)
    return res.status(201).send({status:false, message: "Success", data: savedOrder})
}


const updateOrder = async (req, res) => {

    let {orderId, status} = req.body
    let statuses = [ "pending", "completed", "cancelled" ]

    if(!isValidBody(orderId)) return res.status(400).send({status: false, message: "Enter Order Id."})
    if(!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Enter Valid Order Id." })
     
    if(!statuses.includes(status)) return res.status(400).send({status: false, message: "Invalid Status !!!"})

    let order = await orderModel.findOne({_id:orderId})
    if(!order) return res.status(404).send({status: false, message: "Order Does not Exist"})

     if(order.cancellable == false && status == 'cancelled') return res.status(400).send({status: false, message : "Your Order Cannot be Cancelled"})
    let updatedOrder = await orderModel.findOneAndUpdate({_id: orderId}, {status : status}, {new:true})
    return res.status(200).send({status:true, message : "Success", data: updatedOrder })
}


module.exports = {
    createOrder,
    updateOrder
}