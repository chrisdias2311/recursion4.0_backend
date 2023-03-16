const express = require('express');
const router = express.Router();
const Seller = require('../schemas/SellerSchema')
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { application } = require('express');
const jwt = require('jsonwebtoken');
const multer = require('../middlewares/multer')
const otpGenerator = require('otp-generator');
const auth = require('../mailhandelling/auth');
const mongoose = require('mongoose')
const pass_otp = require('../mailhandelling/passotp')
const secretKey = "secretKey";


router.post("/register", async (req, res) => {

    const saltRounds = 10;
    try {
        const seller = await Seller.findOne({ email: (req.body.email).toLowerCase() })

        if (seller) {
            console.log(seller)
            res.status(400).send("Account already exists");
            return
        } else {
            //bcrypt encryption
            bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
                console.log(hash);
                if (err) {
                    res.send('error generating hash')
                }
                else {
                    const newSeller = new Seller({
                        email: (req.body.email).toLowerCase(),
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        phone: req.body.phone,
                        password: hash,
                        validity: 'No',
                        verified: 'No',
                        otp: "null"
                    });
                    const saved = await newSeller.save((err, seller) => {
                        if (err) {
                            console.log(err);
                            res.send(400, 'bad request');
                        }

                        else {
                            res.send(seller)
                        }
                    });

                }
            })
        }
    } catch (error) {
        console.log(error);
        res.send(error)
    }

})


router.post("/login", async (req, res) => {
    try {
        console.log("The request:", req.body)
        let seller = await Seller.findOne({ email: (req.body.email).toLowerCase() });

        console.log(seller);
        if (seller) {
            //bcrypt compare
            const match = await bcrypt.compare(req.body.password, seller.password);
            if (match) {
                console.log('match')
                res.send(seller);
            }
            else {
                console.log('incorrect password')
                res.send('incorrect password')
            }
        } else {
            res.send("No seller found");
        }
    } catch (error) {
        res.send(error);
        console.log(error);
    }
})


router.get('/generateotp/:id', async (req, res) => {

    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, specialChars: false });
    const seller = await Seller.findOne({ email: (req.params.id).toLowerCase() })

    if (seller) {
        if (seller.verified === 'yes') {
            res.send("already verified")
        }
        else {
            try {
                let test = await Seller.updateOne({ _id: mongoose.Types.ObjectId(seller._id) }, { $set: { verified: otp } })
                console.log(test);
                auth.sendOtp(otp, seller.email);
                console.log(seller.email)
                res.status(200).send('generated');
            } catch (err) {
                console.log(err)
                res.status(400).send(err);
            }
        }
    } else {
        res.status(400).send("No seller found")
    }
})

router.get('/verifyotp/:id/:otp', async (req, res) => {

    const seller = await Seller.findOne({ email: (req.params.id).toLowerCase() });
    console.log(seller);

    if (seller) {
        if (seller.verified === 'yes') {
            res.send("already verified")
        }
        else {
            if (seller.verified == req.params.otp) {
                console.log('passed')
                const update = await Seller.updateOne({ email: (req.params.id).toLowerCase() }, { $set: { verified: 'yes' } })
                console.log("verified");
                res.send(update);

            }
        }
    } else {
        res.status(400).send("No seller found")
    }



})


router.get('/allsellers', async (req, res) => {
    try {
        let seller = await Seller.find({ verified: 'yes' });
        if (seller.length > 0) {
            res.send(seller);
        } else {
            res.send({ result: "No seller found" })
        }
    } catch (error) {
        console.log(error)
    }
})

router.get('/getseller/:id', async (req, res) => {
    try {
        console.log(req.params.id)
        let seller = await Seller.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
        if (seller) {
            res.send(seller);
        }
    } catch (err) {
        console.log(err);
        res.status(400).send('couldnt find seller')
    }

})

module.exports = router;