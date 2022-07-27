const productModel = require("../models/productModel")
const validator = require('../validator/validator')
const { uploadFile } = require('../aws/config')
const { findOne } = require("../models/productModel")
const { connection } = require("mongoose")


const createProduct = async (req, res) =>{
    try{
        let product = req.body
        let file = req.files
    
        product.availableSizes = JSON.parse(product.availableSizes)
    
        const { title, description, price, currencyId, currencyFormat, availableSizes, installments } = body;
    
        if (!title) {
            return res.status(400).send({ status: false, msg: "Plz Enter title In Body !!!" });
        }
    
        if (!isValidName(title)) {
            return res.status(400).send({ status: false, msg: "Please mention valid title In Body !!!" });
        }
    
        const findTitle = await productModel.findOne({ title: title });
        if (findTitle) {
            return res.status(400).send({ status: false, msg: "Title Is Already Exists, Plz Enter Another One !!!" });
        }
    
        if (!description) {
            return res.status(400).send({ status: false, msg: "Plz Enter description In Body !!!" });
        }
    
        if (!price) {
            return res.status(400).send({ status: false, msg: "Plz Enter price In Body !!!" });
        }
    
        if (!currencyId) {
            return res.status(400).send({ status: false, msg: "Plz Enter currencyId In Body !!!" });
        }
        if (currencyId != 'INR') {
            return res.status(400).send({ status: false, msg: "Plz Enter currencyID in INR format !!!" });
        }
        if (!currencyFormat) {
            return res.status(400).send({ status: false, msg: "Plz Enter currencyFormat In Body !!!" });
        }
    
        if (currencyFormat != '₹') {
            return res.status(400).send({ status: false, msg: "Plz Use Indian Currency Format(₹) In Body !!!" });
        }
    
        if (!availableSizes) {
            return res.status(400).send({ status: false, msg: "Plz Enter availableSizes In Body !!!" });
        }
    
        if (file && file.length > 0)   product.productImage = await uploadFile(file[0])
    
        let savedProduct = await productModel.create(product)
        console.log(savedProduct)
        return res.status(201).send({status : true, message: "Success", data :savedProduct})
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }

}

 const getProduct = async (req, res) =>{

    let {size , title, priceGreater, priceLess} = req.query
    //let obj = {}
    let obj = {isDeleted : false}

    //Validation Remaining for Getting filter size and title value cannot be empty tring
    if(size) obj.availableSizes = size
    if(title) obj.title = title

    console.log(title)
    let product = await productModel.findOne(obj).sort({price: 1})
    if(!product) return res.status(404).send({status : false, message : "Product Not Found."})

    return res.status(200).send({status: true, message: "Successful", data: product})

 } 
 
 const getProductById = async (req, res) => {
    let id = req.params.productId
    let obj = {_id: id, isDeleted: false}
    let product = await productModel.findOne(obj)
    if(!product) return res.status(404).send({status : false, message: "Product Not Found !!"})
    return res.status(200).send({status : true, message: "Successful", data: product})
 }

 const updateProduct = async (req, res) =>{
        let id = req.params.productId
        let {title, description, price, style} = req.body
        let obj = {_id: id, isDeleted : false}
        let UpObj = {}

        if(title) UpObj.title = title
        if(description) UpObj.description = description
        if(price) UpObj.price = price
        if(style) UpObj.style = obj.style

        let product = await productModel.findOneAndUpdate(
            obj,
            {$set : UpObj},
           { new : true}
        )
        // {_id: id, isDeleted : false},
        // {$set: UpObj},
        // {new: true}

        if(!product) return res.status(404).send({status:false, message: "Product Not Found"})

        return res.status(200).send({status: true, message: "Successful", data: product})


 }



const deleteById = async function (req, res) {
    try {

        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: `this productId is not valid` })
        }

        let deletedProduct = await productModel.findById({ _id: productId })
        if (!deletedProduct) {
            return res.status(404).send({ status: false, msg: `this productId is not exist in db` })
        }

        if (deletedProduct.isDeleted !== false) {
            return res.status(404).send({ status: false, msg: `this productId is Not Found` })
        }

        await productModel.findByIdAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })

        return res.status(200).send({ status: true, msg: "successfully deleted" })

    }

    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
};



module.exports = {
    createProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteById
}