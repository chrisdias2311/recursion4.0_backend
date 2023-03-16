const express = require('express');
const router = express.Router();
const User = require('../schemas/Userschema')
const bcrypt = require('bcryptjs');
const { application } = require('express');
const jwt = require('jsonwebtoken');
const multer = require('../middlewares/multer')
const otpGenerator = require('otp-generator');
const auth = require('../mailhandelling/auth');
const { markAsUntransferable } = require('worker_threads');
const Product = require('../schemas/ProductSchema')

router.post('/uploadimages', multer.upload.single("file"), async (req, res) => {
    try {
        console.log(req.file)
        const FindProduct = await Product.findOne({ name: req.body.productname })
        if (FindProduct) {
            try {
                const UpdateProduct = await Product.updateOne({ name: req.body.productname }, { $push: { 'productImage': `${URL}/api/image/${req.file.filename}` } })
            } catch (err) {
                console.log(err);
                res.status(500).send('error updating database');
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('internal error')
    }
})

module.exports = router;