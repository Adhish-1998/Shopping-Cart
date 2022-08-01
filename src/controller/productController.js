const productModel = require("../models/productModel")

const { uploadFile } = require('../aws/config')
const { isValidBody, isValidName, isValidPrice, isValidObjectId, validProdName } = require('../validator/validator')



const createProduct = async (req, res) => {
    try {
        let product = req.body
        let file = req.files
        let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        if (Object.keys(req.body).length == 0)
            return res.status(400).send({ status: false, msg: "Plz Enter Fields In Body !!!" });

        let obj = {}
        console.log(file)

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = req.body;

        if (!isValidBody(title)) return res.status(400).send({ status: false, msg: "Please enter title !!!" });
        if (!validProdName(title)) return res.status(400).send({ status: false, msg: "Please mention valid title In Body !!!" });
        obj.title = title

        if (!isValidBody(description)) return res.status(400).send({ status: false, msg: "Please enter description !!!" });
        obj.description = description

        if (!isValidBody(price)) return res.status(400).send({ status: false, msg: "Please enter price !!!" });
        if (!isValidPrice(price)) return res.status(400).send({ status: false, msg: "Please valid valid price In Body !!!" });
        obj.price = price

         if(currencyId ||  currencyId== ''){
            if (!isValidBody(currencyId)) return res.status(400).send({ status: false, msg: "Please enter CurrencyId !!!" });
            if(currencyId != 'INR') return res.status(400).send({ status: false, msg: "CurrencyId must be 'INR' !!!" });
            obj.currencyId = currencyId
        }  
        
        if(currencyFormat || currencyFormat == ''){
            if (!isValidBody(currencyFormat)) return res.status(400).send({ status: false, msg: "Please enter currencyFormat !!!" });
            if(currencyFormat != '₹') return res.status(400).send({ status: false, msg: "currency Format must be '₹' !!!" });
            obj.currencyFormat = currencyFormat
        } 

        if (!isValidBody(isFreeShipping)) return res.status(400).send({ status: false, msg: "Please enter value of Free Shipping !!!" });
        if (isFreeShipping !== 'true') return res.status(400).send({ status: false, msg: "Please valid value of Free shipping !!!" });
        obj.isFreeShipping = true


        if (file.length == 0) return res.status(400).send({ status: false, msg: "Please Enter Product Image" })

        if (style || style == '') {
            if (!isValidBody(style)) return res.status(400).send({ status: false, msg: "Please enter style !!!" });
            if (!isValidName(style)) return res.status(400).send({ status: false, msg: "Please valid style !!!" });
            obj.style = style
        }



        if (!isValidBody(availableSizes)) return res.status(400).send({ status: false, msg: "Please enter Size !!!" });
        availableSizes = availableSizes.split(',').map((item) => item.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!sizes.includes(availableSizes[i]))
                return res.status(400).send({ status: false, msg: "Please mention valid Size !!!" });
        }
        obj.availableSizes = availableSizes
        if (!isValidBody(installments)) return res.status(400).send({ status: false, msg: "Please enter installments !!!" });
        if (!(/^[0-9]+$/.test(installments))) return res.status(400).send({ status: false, msg: "Indstallments must be number!!!" });
        obj.installments = installments


        if (file && file.length > 0) obj.productImage = await uploadFile(file[0])

        const findTitle = await productModel.findOne({ title: title });
        if (findTitle) {
            return res.status(400).send({ status: false, msg: "Title Is Already Exists, Plz Enter Another One !!!" });
        }

        let savedProduct = await productModel.create(obj)
        console.log(savedProduct)
        return res.status(201).send({ status: true, message: "Success", data: savedProduct })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }

}

const getProduct = async (req, res) => {

    if (Object.keys(req.query) == 0) {
        let products = await productModel.find({ isDeleted: false }).select({ isDeleted: 0, createdAt: 0, updatedAt: 0, deletedAt: 0 })
        if (products.length == 0) return res.status(404).send({ status: false, message: "Products not found" })
        return res.status(200).send({ status: true, message: "Success", data: products })
    }

    let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query
    let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]

    obj = { isDeleted: false }


    if (size || size == '') {
        if (!isValidBody(size)) return res.status(400).send({ status: false, msg: "Please enter Size !!!" });
        size = size.split(',').map((item) => item.trim())
        for (let i = 0; i < size.length; i++) {
            if (!sizes.includes(size[i]))
                return res.status(400).send({ status: false, msg: "Please mention valid Size In Body !!!" });
        }
        obj.availableSizes = { $all: size }
    }

    if (name || name == '') {
        if (!isValidBody(name)) return res.status(400).send({ status: false, msg: "Please enter name !!!" });
        if (!validProdName(name)) return res.status(400).send({ status: false, msg: "Please mention valid name !!!" });
        obj.title = { $regex: name }
    }

    if (priceGreaterThan || priceGreaterThan == '') {
        if (!isValidBody(priceGreaterThan)) return res.status(400).send({ status: false, msg: "Please enter Price Greater Than !!!" });
        if (!isValidPrice(priceGreaterThan)) return res.status(400).send({ status: false, msg: "Price Greater Than must be number !!!" });
        obj.price = { $gt: priceGreaterThan }
    }

    if (priceLessThan || priceLessThan == '') {
        if (!isValidBody(priceLessThan)) return res.status(400).send({ status: false, msg: "Please enter Price Lesser Than !!!" });
        if (!isValidPrice(priceLessThan)) return res.status(400).send({ status: false, msg: "Price Lesser Than must be number !!!" });
        obj.price = { $lt: priceLessThan }
    }
    if (priceGreaterThan && priceLessThan)
        obj.price = { $gt: priceGreaterThan, $lt: priceLessThan }

    if(!isValidBody(priceSort)) return res.status(400).send({ status: false, msg: "Please enter priceSort !!!" });
     if(!(priceSort == -1 || priceSort == 1)) return res.status(400).send({ status: false, msg: "Please enter 1 for Ascending order or -1 for Descending Order !!!" });

    product = await productModel.find(obj).sort({ price: priceSort })
    if (product.length == 0) return res.status(404).send({ status: false, message: "Product Not Found." })
    return res.status(200).send({ status: true, message: "Successful", data: product })

}



const getProductById = async (req, res) => {


    let id = req.params.productId
    if (id == ':productId') return res.status(400).send({ status: false, msg: "Please Enter Product Id" })
    let obj = { _id: id, isDeleted: false }
    let product = await productModel.findOne(obj)
    if (!product) return res.status(404).send({ status: false, message: "Product Not Found !!" })
    return res.status(200).send({ status: true, message: "Successful", data: product })
}

const updateProduct = async (req, res) => {

    if (Object.keys(req.body).length == 0)
       return res.status(400).send({ status: false, msg: "Minimum 1 field required to be updated !!!" });

    let id = req.params.productId
    if (id == ':productId') return res.status(400).send({ status: false, msg: "Please Enter Product Id" })

    let file = req.files
    let { title, description, price, isFreeShipping, style, availableSizes, installments } = req.body
    let obj = { _id: id, isDeleted: false }
    // availableSizes = availableSizes.split(',').map((item) => item.trim())
    //console.log(availableSizes)
    let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]

    let UpObj = {}
    //isValidBody
    if (title || title == '') {
        if (!isValidBody(title)) return res.status(400).send({ status: false, msg: "Please enter title !!!" });
        if (!isValidName(title)) return res.status(400).send({ status: false, msg: "Please mention valid title !!!" });
        UpObj.title = title
    }

    if (description || description == ''){
        if (!isValidBody(description)) return res.status(400).send({ status: false, msg: "Please enter Description !!!" });
        UpObj.description = description
    } 

    if (price || price == '') {
        if (!isValidBody(price)) return res.status(400).send({ status: false, msg: "Please enter price !!!" });
        if (!isValidPrice(price)) return res.status(400).send({ status: false, msg: "Price Must be Number!!!" });
        UpObj.price = price
    }


    if (isFreeShipping || isFreeShipping == '') {
        if (!isValidBody(isFreeShipping)) return res.status(400).send({ status: false, msg: "Please enter value of Free Shipping !!!" });
        if (isFreeShipping !== 'true') return res.status(400).send({ status: false, msg: "Please valid value of Free shipping !!!" });
        UpObj.style = style
    }

    //console.log(productImage)
   
    //if (file.length == 0) return res.status(400).send({ status: false, msg: "Please Enter Product Image" })

    if (file && file.length > 0) UpObj.productImage = await uploadFile(file[0])

    if (style || style == '') {
        if (!isValidBody(style)) return res.status(400).send({ status: false, msg: "Please enter style !!!" });
        if (!isValidName(style)) return res.status(400).send({ status: false, msg: "Please mention valid style In Body !!!" });
        UpObj.style = obj.style
    }

    if (availableSizes || availableSizes == '') {
        if (!isValidBody(availableSizes)) return res.status(400).send({ status: false, msg: "Please enter Size !!!" });
        availableSizes = availableSizes.split(',').map((item) => item.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!sizes.includes(availableSizes[i]))
                return res.status(400).send({ status: false, msg: "Please mention valid Size!!!" });
        }
        UpObj.availableSizes = availableSizes
    }

    if (installments || installments == '') {
        if (!isValidBody(installments)) return res.status(400).send({ status: false, msg: "Please enter installments !!!" });
        if (!(/^[0-9]+$/.test(installments))) return res.status(400).send({ status: false, msg: "Please mention valid indstallments !!!" });
        UpObj.installments = installments
    }

    let product = await productModel.findOneAndUpdate(
        obj,
        { $set: UpObj },
        { new: true }
    )

    if (!product) return res.status(404).send({ status: false, message: "Product Not Found" })

    return res.status(200).send({ status: true, message: "Successful", data: product })


}



const deleteById = async function (req, res) {
    try {

        const productId = req.params.productId
        if (productId == ':productId') return res.status(400).send({ status: false, msg: "Please Enter Product Id" })
        let obj = { _id: productId, isDeleted: false }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: `this productId is not valid` })
        }


        let deletedProduct = await productModel.findOneAndUpdate(obj, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        if (!deletedProduct) {
            return res.status(404).send({ status: false, msg: 'Product Not Found !!!' })
        }

        return res.status(200).send({ status: true, msg: "successfully deleted" })

    }catch (err) {
        
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




