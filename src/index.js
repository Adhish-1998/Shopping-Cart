const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const route = require('./routes/route')
const multer = require('multer')

const app = express();
app.use(bodyParser.json())
app.use(multer().any())

app.use((err,req,res,next) => {
    if(err.message == 'Bad Request')
        return res.status(400).send({status : false, message: 'Invalid File Format!!'})
    next()
})

app.use('/', route)

const string = "mongodb+srv://Adhish-1998-DataBase:vQrIj9jTyDzRssqt@cluster0.af5tq.mongodb.net/group48DataBase"

mongoose.connect(string, { useNewUrlParser: true })
    .then(() => console.log("mongoDB is connected"))
    .catch((err) => console.log(err));



const port = process.env.PORT || 3000
app.listen(port, function () {
    console.log("app is running on the port" + port)
})
