const userModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const validator = require('../validator/validator')
const jwt = require('jsonwebtoken')
const saltRounds = 10
const {uploadFile} = require('../aws/config')

//fname, lname, email, profileimage, phone, password, address[street, city, code]

const createUser = async function (req,res){
    // try{
        let userDetail = req.body
        if(Object.keys(userDetail).length ==0 )
            return res.status(400).send({status: false, msg : "Request Body cannot be empty."})
        
        let { fname, lname, email , phone, password} = userDetail
        let file = req.files
        // let {shipping, billing} = address
        // let {Sstreet, Scity, Spin} = shipping
        // let {Bstreet, Bcity, Bpin} = billing
        if (!validator.isValidBody(fname)) { return res.status(400).send({ status: false, msg: 'Please enter fname' }) }
        if (!validator.isValidBody(lname)) { return res.status(400).send({ status: false, msg: 'Please enter fname' }) }
        if (!validator.isValidBody(email)) { return res.status(400).send({ status: false, msg: 'Please enter the Email Id' }) }
        if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, msg: 'Please enter valid emailId' }) }
        //profileImage
        if (!validator.isValidBody(phone)) { return res.status(400).send({ status: false, msg: 'Please enter the Mobile Number' }) }
        if (!validator.isValidMobileNumber(phone)) { return res.status(400).send({ status: false, msg: 'Please enter valid Mobile Number' }) }
        if (!validator.isValidBody(password)) { return res.status(400).send({ status: false, msg: 'Please enter the password' }) }
        // to validate the password in given length
        if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, msg: "password should be have minimum 8 character and max 15 character" }) }
 
        if(file && file.length > 0) {
            let uploadUrl = await uploadFile(file[0])
            //console.log(uploadUrl)
            userDetail.profileImage = uploadUrl
      
        }
        
        //var password = req.body.password;

        // let hello
        password = await bcrypt.hash(password, saltRounds)
                   .then((hash) => hash)
                   

        userDetail.password = password
        // bcrypt.genSalt(saltRounds, function(err, salt) {
        //     bcrypt.hash(password, salt, function(err, hash) {
        //     // returns hash
        //     console.log(hash);
        //     hello = hash
        //     });
           
        //   });
        
        //userDetail.password = hello
        // console.log( hello )
        const isDuplicateNumber = await userModel.find({ phone: phone })
        if (isDuplicateNumber.length !=0) { return res.status(400).send({ status: false, msg: 'This number is already exist' }) }
        
        const isDuplicateEmail = await userModel.find({ email: email })
        if (isDuplicateEmail.length !=0) { return res.status(400).send({ status: false, msg: 'This mailId is already exist' }) }


        let savedUser = await userModel.create(userDetail)
       return  res.status(201).send({
            status:true,
            msg: "User created successfully",
            Data:savedUser
        })
    // }
    // catch(err){
    //     res.status(500).send({
    //         status:false,
    //         msg:err.message
    //     })
    // }
}
module.exports.createUser=createUser

// if (!Validator.isValidBody(title)) { return res.status(400).send({ status: false, msg: 'Please enter the title' }) }
//         // to validate the enum 
// if (["Mr", "Mrs", "Miss"].indexOf(title) == -1) { return res.status(400).send({ status: false, msg: 'Please select the title in Mr Mrs & Miss' }) }


const createLogin =async function (req,res){
    const requestbody = req.body
    const { email, password } = requestbody

    if (!validator.isValidBody(email)) { return res.status(400).send({ status: false, msg: 'Please enter the Email Id' }) }
    if (!validator.isValidEmail(email)) { return res.status(400).send({ status: false, msg: 'Please enter valid emailId' }) }

    if (!validator.isValidBody(password)) { return res.status(400).send({ status: false, msg: 'Please enter the password' }) }
    if (!validator.isValidpassword(password)) { return res.status(400).send({ status: false, msg: "password should be have minimum 8 character and max 15 character" }) }
    
    const user=await userModel.findOne({email:email,password:password})
    if(!user) {return res.status(400).send({status:false,msg:'No such user found'})}
    
    // if(bcrypt.compare(password, user.password )){}

        let token =jwt.sign({
            userId:user._id.toString(),
            project: "Project-5",
            iat:Math.floor(Date.now() / 1000),
            exp:Math.floor(Date.now() / 1000) + 10*60*60
        }, "Project-5 product Management ");
        

    
    
    res.status(200).send({
        status:true,
        message:'User login successfull',
        data:{
            userId: user._id,
            token : token 
            
        }
    })
}
module.exports.createLogin=createLogin


const getUser = async function (req,res){
    try{

    //   let token = req.headers.authorization.slice(7)
    //   console.log(token)
    let userId = req.params.userId

    let findUser = await userModel.findOne({ _id: userId })
    if (!findUser) return res.status(402).send({ status: false, msg: "Please enter valid userId" })
    return res.status(200).send({status:false, msg :"User profile details", data: findUser})
    }
    catch(err){
        res.status(500).send({
            status:false,
            msg:err.message
        })
}
}

module.exports.getUser = getUser


const updateUser = async function (req, res) {
    let { fname, lname, email, phone, password , address} = req.body
    let file = req.files
    let id = req.userId
    let obj = {}

    if(fname) obj.fname = fname
    if(lname) obj.lname = lname
    if(email) obj.lname = lname
    if(phone) obj.lname = lname
    if(password) obj.lname = lname
    if(file && file.length > 0) {
        let uploadUrl = await uploadFile(file[0])
        //console.log(uploadUrl)
        obj.profileImage = uploadUrl
  
    }

    let updatedUser = await userModel.findOneAndUpdate(
       { _id: id},
        obj,
        {new :true}
    )

    return res.status(200).send({status : true, data: updatedUser})
}


module.exports.updateUser = updateUser

// let Password = bcrypt.hash(data.password, saltRounds)
//      .then((hash) => {
//      console.log(`Hash: ${hash}`);
//   return hash;
// });
// data.password = await encryptedPassword;