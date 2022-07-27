const productModel = require("../models/productModel")
const validator = require('../validator/validator')
const { uploadFile } = require('../aws/config')
const {isValidBody,isValidName, isValidPrice, isValidObjectId} = require('../validator/validator')
//const productModel = require("../models/productModel")
//const { connection } = require("mongoose")


const createProduct = async (req, res) =>{
    // try{
        let product = req.body
        let file = req.files
        let sizes = ["S", "XS","M","X", "L","XXL", "XL"]
        if(Object.keys(req.body).length == 0) 
          return res.status(400).send({ status: false, msg: "Plz Enter Fields In Body !!!" });
        console.log(req.body)
        let obj = {}
        //product.availableSizes = JSON.parse(product.availableSizes)
    
        const { title, description, price, isFreeShipping , style, availableSizes,  installments } = req.body;
    
        if(title || title == '') {
            if(!isValidBody(title)) return res.status(400).send({ status: false, msg: "Please enter title !!!" });
            if(!isValidName(title)) return res.status(400).send({ status: false, msg: "Please mention valid title In Body !!!" });
        }
        obj.title = title

        // if (!isValidName(title)) {
        //     return res.status(400).send({ status: false, msg: "Please mention valid title In Body !!!" });
        // }
    
        if (description || description == '' ) {
            if(!isValidBody(description)) return res.status(400).send({ status: false, msg: "Please enter description !!!" });
        }
        obj.description = description

        if (price || price == '') {
            if(!isValidBody(price)) return res.status(400).send({ status: false, msg: "Please enter price !!!" });
            if(!isValidPrice(price)) return res.status(400).send({ status: false, msg: "Please valid valid price In Body !!!" });
        }
        obj.price = price

        if (isFreeShipping || isFreeShipping == '') {
            if(!isValidBody(isFreeShipping)) return res.status(400).send({ status: false, msg: "Please enter Free Shipping !!!" });
            if(isFreeShipping !== 'true') return res.status(400).send({ status: false, msg: "Please value of free shipping in Body !!!" });
            obj.isFreeShipping = true
        }

        if(file.length == 0) return res.status(400).send({ status: false, msg: "Please upload File" })

        if (style || style == '') {
            if(!isValidBody(style)) return res.status(400).send({ status: false, msg: "Please enter style !!!" });
            if(!isValidName(style)) return res.status(400).send({ status: false, msg: "Please valid style In Body !!!" });
        }
        obj.style = style


        if(availableSizes || availableSizes == '' ) {
            if(!isValidBody(availableSizes)) return res.status(400).send({ status: false, msg: "Please enter Size !!!" });
            if(!sizes.includes(availableSizes)) return res.status(400).send({ status: false, msg: "Please mention valid Size In Body !!!" });
            obj.availableSizes = availableSizes
        }

        if(installments || installments == '' ) {
            if(!isValidBody(installments)) return res.status(400).send({ status: false, msg: "Please enter installments !!!" });
            if(!(/^[0-9]+$/.test(installments) )) return res.status(400).send({ status: false, msg: "Please mention valid indstallments In Body !!!" });
            obj.installments = installments
        }
        
        // if (!currencyId) {
        //     return res.status(400).send({ status: false, msg: "Plz Enter currencyId In Body !!!" });
        // }
        // if (currencyId != 'INR') {
        //     return res.status(400).send({ status: false, msg: "Plz Enter currencyID in INR format !!!" });
        // }
        // if (!currencyFormat) {
        //     return res.status(400).send({ status: false, msg: "Plz Enter currencyFormat In Body !!!" });
        // }
    
        // if (currencyFormat != '₹') {
        //     return res.status(400).send({ status: false, msg: "Plz Use Indian Currency Format(₹) In Body !!!" });
        // }
    
        // if (!availableSizes) {
        //     return res.status(400).send({ status: false, msg: "Plz Enter availableSizes In Body !!!" });
        // }
    
        if (file && file.length > 0)   obj.productImage = await uploadFile(file[0])

        const findTitle = await productModel.findOne({ title: title });
        if (findTitle) {
            return res.status(400).send({ status: false, msg: "Title Is Already Exists, Plz Enter Another One !!!" });
        }

        obj.currencyId = 'INR'
        obj.currencyFormat = '₹'
        let savedProduct = await productModel.create(obj)
        console.log(savedProduct)
        return res.status(201).send({status : true, message: "Success", data : savedProduct})
    //}
    // catch (err) {
    //     res.status(500).send({ status: false, msg: err.message });
    // }

}

 const getProduct = async (req, res) =>{

    if(Object.keys(req.query) == 0) {
        let products = await productModel.find({isDeleted : false}).select({isDeleted: 0, createdAt:0, updatedAt:0, deletedAt:0})
        if(products.length == 0) return res.status(404).send({status:false , message : "Products not found"})
        return res.status(200).send({status : true, message : "Success", data: products})
    }

    let { size , name , pricegt, pricels } = req.query
    console.log(size, name, pricegt, pricels)

    obj = {isDeleted : false}
    if(size){
        obj.availableSizes = size
    }
    if(name){
        obj.title = name
    }
    let gt = req.query.pricegt
    
    console.log(gt)

    //Validation Remaining for Getting filter size and title value cannot be empty tring
    // if(size) obj.availableSizes = size
    // if(title) obj.title = title

    console.log(obj)
    //let product = await productModel.find({title : req.query.title}, {availableSizes : req.query.size}, {price: {$gt :gt}})
    let product = await productModel.find(obj,{price: {$gt: gt}}).sort({price: 1}) //,{price: {$gt: gt}}
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
        let file = req.files
        let {title, description, price, isFreeShipping, style, availableSizes, installments} = req.body
        let obj = {_id: id, isDeleted : false}
        let sizes = ["S", "XS","M","X", "L","XXL", "XL"]
        let UpObj = {}
        //isValidBody
        if(title || title == '') {
            if(!isValidBody(title)) return res.status(400).send({ status: false, msg: "Please enter title !!!" });
            if(!isValidName(title)) return res.status(400).send({ status: false, msg: "Please mention valid title In Body !!!" });
            UpObj.title = title
        }

        if(description || description == '') UpObj.description = description
        if(price || price == '' ) {
            if(!isValidBody(price)) return res.status(400).send({ status: false, msg: "Please enter price !!!" });
            if(!isValidPrice(price)) return res.status(400).send({ status: false, msg: "Please enter valid price in Body !!!" });
            UpObj.price = price
        }


        if(isFreeShipping || isFreeShipping == '') {
            if(!isValidBody(isFreeShipping)) return res.status(400).send({ status: false, msg: "Please enter price !!!" });
            if(!isValidName(stisFreeShippingyle)) return res.status(400).send({ status: false, msg: "Please mention valid style In Body !!!" });
            UpObj.style = style
        }


        if (file && file.length > 0)  obj.productImage = await uploadFile(file[0])

        if(style || style == '' ) {
            if(!isValidBody(style)) return res.status(400).send({ status: false, msg: "Please enter style !!!" });
            if(!isValidName(style)) return res.status(400).send({ status: false, msg: "Please mention valid style In Body !!!" });
            UpObj.style = obj.style
        }

        if(availableSizes || availableSizes == '' ) {
            if(!isValidBody(availableSizes)) return res.status(400).send({ status: false, msg: "Please enter Size !!!" });
            if(!sizes.includes(availableSizes)) return res.status(400).send({ status: false, msg: "Please mention valid Size In Body !!!" });
            UpObj.style = obj.style
        }

        if(installments || installments == '' ) {
            if(!isValidBody(installments)) return res.status(400).send({ status: false, msg: "Please enter installments !!!" });
            if(!(/^[0-9]+$/.test(installments) )) return res.status(400).send({ status: false, msg: "Please mention valid indstallments In Body !!!" });
            UpObj.installments = installments
        }

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
        let obj = {_id: productId, isDeleted: false}

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: `this productId is not valid` })
        }

        //let deletedProduct = await productModel.findById({ _id: productId }

        // if (deletedProduct.isDeleted !== false) {
        //     return res.status(404).send({ status: false, msg: `this productId is Not Found` })
        // }

        let deletedProduct = await productModel.findOneAndUpdate(obj, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        if (!deletedProduct) {
            return res.status(404).send({ status: false, msg: `this productId is not exist in db` })
        }

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