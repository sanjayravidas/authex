const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Emp = require('./models/employee')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var crypto = require('crypto');
var key = "password";
var algo = 'aes256';

//
const jwt = require('jsonwebtoken')
jwtKey = "jwt"
//

mongoose.connect('mongodb+srv://marvel:dassanjay@123@cluster0.fntz2.mongodb.net/helponeretryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.warn("connected");
})


app.post('/register', jsonParser, function (req, res) {
    var cipher = crypto.createCipher(algo, key);
    var encrypted = cipher.update(req.body.password, 'utf8', 'hex')
        + cipher.final('hex');
    console.warn(encrypted)
    const data = new Emp({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        password: encrypted
    })
    data.save().then((result) => {
        jwt.sign({ result }, jwtKey, { expiresIn: '3000s' }, (err, token) => {
            res.status(201).json({ token })
        })
        //res.status(201).json(result)
    })
        .catch((err) => console.warn(err))
})
app.post('/login', jsonParser, function (req, res) {
    Emp.findOne({ email: req.body.email }).then((data) => {
        var decipher = crypto.createDecipher(algo, key);
        var decrypted = decipher.update(data.password, 'hex', 'utf8') +
            decipher.final('utf8');
        // console.warn("decrypted",decrypted);
        if (decrypted == req.body.password) {
            jwt.sign({ data }, jwtKey, { expiresIn: '3000s' }, (err, token) => {
                res.status(200).json({ token })
            })
        }
        //res.json(data)
    })
})
app.get('/employee', verifyToekn, function (req, res) {
    Emp.find().then((result) => {
        res.status(200).json(result)
    })
})
function verifyToekn(req, res, next) {
    const bearerHeader = req.headers['authorization'];



    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ')
        console.warn(bearer[1])
        req.token = bearer[1]
        jwt.verify(req.token, jwtKey, (err, authData) => {
            if (err) {
                res.json({ result: err })
            }
            else {
                next();
            }
        })
    }
    else {
        res.send({ "result": "Token not provided" })
    }
}
app.listen(5500);
