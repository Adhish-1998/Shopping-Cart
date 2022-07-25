const userModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const saltRounds = 10



const createUser = async function (req,res){
    try{
        let userDetail = req.body
        var password = req.body.password;
        let hello 
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
            // returns hash
            console.log(hash);
            hello = hash
            });
           
          });
        
        //userDetail.password = hello
        console.log( hello )
        let savedUser = await userModel.create(userDetail)
        res.status(201).send({
            status:true,
            msg: "User created successfully",
            Data:savedUser
        })
    }
    catch(err){
        res.status(500).send({
            status:false,
            msg:err.message
        })
    }
}
module.exports.createUser=createUser