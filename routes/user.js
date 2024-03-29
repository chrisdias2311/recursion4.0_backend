const express = require('express');
const router = express.Router();
const User = require('../schemas/Userschema')
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { application } = require('express');
const jwt = require('jsonwebtoken');
const multer = require('../middlewares/multer')
const otpGenerator = require('otp-generator');
const auth = require('../mailhandelling/auth');
const mongoose = require('mongoose')
const pass_otp = require('../mailhandelling/passotp');
const TrackSchema = require('../schemas/TrackSchema');
const secretKey = "secretKey";

const URL = `https://recursion4-0-backend-server.onrender.com`//`https://uniexserver.onrender.com` 


router.post('/gettransactions', async (req, res) => {
    const tracker = await TrackSchema.find({ buyeremail: req.body.email }).catch((err) => {
        console.log(err)
        res.send('internal error').status(500)
    });

    if (tracker) {
        res.send(tracker.reverse()).status(200)

    }
    else {
        res.send('transactions not available').status(400);
    }
})


//Rigister (alternative to Signup)
router.post("/register", async (req, res) => {

    const saltRounds = 10;
    try {
        const user = await User.findOne({ email: (req.body.email).toLowerCase() })

        if (user) {
            console.log(user)
            res.status(400).send("Account already exists");

        } else {

            //bcrypt encryption
            bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
                console.log(hash);
                if (err) {
                    res.send('error generating hash')
                }
                else {
                    const newUser = new User({
                        email: (req.body.email).toLowerCase(),
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        phone: req.body.phone,
                        gender: req.body.gender,
                        age: req.body.age,
                        password: hash,
                        verified: 'No',
                        otp: "null",
                    });
                    const saved = await newUser.save((err, user) => {
                        if (err) {
                            console.log(err);
                            res.send(400, 'bad request');
                        }

                        else {
                            res.send(user)
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
        let user = await User.findOne({ email: (req.body.email).toLowerCase() });

        console.log(user);
        if (user) {
            //bcrypt compare
            const match = await bcrypt.compare(req.body.password, user.password);
            if (match) {
                console.log('match')
                res.send(user).status(200); //dont think we should send user!!!!
            }
            else {
                console.log('incorrect password')
                res.send('incorrect password').status(400)
            }
        } else {
            res.send("No user found").status(400);
        }
    } catch (error) {
        res.send(error).status(400);
        console.log(error);
    }
})


router.get('/invalidusers', async (req, res) => {
    try {
        let users = await User.find(
            { validity: 'No' }
        );
        if (users.length > 0) {
            console.log(users)
            res.send(users);
        } else {
            res.send({ result: "No users found" })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/getuser', async (req, res) => {
    try {
        let user = await User.findOne({ email: (req.body.verifyEmail).toLowerCase() })
        if (user) {
            res.send(user).status(200);
        } else {
            res.send("No seller found").status(400);
        }
    } catch (error) {

        console.log(err);
        res.status(500).send('internal error')
    }
})

router.put("/validateuser/:id", async (req, res) => {
    try {
        let gridfsBucket;
        let removingFile;
        try {
            let toDelete = await User.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
            console.log("To Delete ", toDelete)

            let filename = toDelete.IDcard;

            let temp = []
            temp = filename.split("/")
            console.log(temp)
            removingFile = temp[temp.length - 1]
            console.log(removingFile);

        } catch (err) {
            console.log(err)
        }


        try {
            gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connections[0].db, {
                bucketName: "uploads",
            });

            const img = await gridfsBucket.find({ filename: removingFile }).toArray();
            img.map(async (doc) => {
                const del = await gridfsBucket.delete(doc._id)
                console.log(del)
            })

        } catch (error) {
            console.log("Not Done")
        }

        try {
            let result = await User.updateOne(
                { _id: req.params.id },
                {
                    $set: req.body
                }
            )
            res.send(result);
        } catch (error) {
            console.log(error);
            res.send(error);
        }

    } catch (error) {
        console.log(error);
        res.send(error)
    }
})

router.put("/declineuser/:id", async (req, res) => {
    try {
        let gridfsBucket;
        let removingFile;
        try {
            let toDelete = await User.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
            console.log("To Delete ", toDelete)

            let filename = toDelete.IDcard;

            let temp = []
            temp = filename.split("/")
            console.log(temp)
            removingFile = temp[temp.length - 1]
            console.log(removingFile);

        } catch (err) {
            console.log(err)
        }


        try {
            gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connections[0].db, {
                bucketName: "uploads",
            });

            const img = await gridfsBucket.find({ filename: removingFile }).toArray();
            img.map(async (doc) => {
                const del = await gridfsBucket.delete(doc._id)
                console.log(del)
            })

        } catch (error) {
            console.log("Not Done")
        }

        try {
            let result = await User.updateOne(
                { _id: req.params.id },
                {
                    $set: req.body
                }
            )
            res.send(result);
        } catch (error) {
            console.log(error);
            res.send(error);
        }

    } catch (error) {
        console.log(error);
        res.send(error)
    }

})


router.get('/generateotp/:id', async (req, res) => {

    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, specialChars: false });
    const user = await User.findOne({ email: (req.params.id).toLowerCase() })

    if (user) {
        if (user.verified === 'yes') {
            res.send("already verified")
        }
        else {
            try {
                let test = await User.updateOne({ _id: mongoose.Types.ObjectId(user._id) }, { $set: { verified: otp } })
                console.log(test);
                console.log(user.email)
                auth.sendOtp(otp, user.email);
                console.log(user.email)
                res.status(200).send('generated');
            } catch (err) {
                console.log(err)
                res.status(400).send(err);
            }
        }
    } else {
        res.status(400).send("No user found")
    }
})

router.get('/verifyotp/:id/:otp', async (req, res) => {

    const user = await User.findOne({ email: (req.params.id).toLowerCase() });
    console.log(user);

    if (user) {
        if (user.verified === 'yes') {
            res.send("already verified")
        }
        else {
            if (user.verified == req.params.otp) {
                console.log('passed')
                const update = await User.updateOne({ email: (req.params.id).toLowerCase() }, { $set: { verified: 'yes' } })
                console.log("verified");
                res.send(update);

            }
        }
    } else {
        res.status(400).send("No user found")
    }



})





router.get('/generateotp_pass/:id', async (req, res) => {

    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, specialChars: false });
    const user = await User.findOne({ email: (req.params.id).toLowerCase() })
    console.log("This is request id", req.params.id)
    if (user) {
        try {
            let test = await User.updateOne({ _id: mongoose.Types.ObjectId(user._id) }, { $set: { otp: otp } })
            console.log(test);
            pass_otp.sendOtp(otp, user.email);

            res.status(200).send('generated');
        } catch (err) {
            console.log(err)
            res.status(400).send(err);
        }
    } else {
        res.status(400).send('No user found');
        console.log('No user found')
    }
})


router.get('/verifyotp_pass/:id/:otp', async (req, res) => {

    const user = await User.findOne({ email: (req.params.id).toLowerCase() });

    if (user) {
        if (user.otp === req.params.otp) {
            const u_otp = await User.updateOne({ email: (req.params.id).toLowerCase() }, { $set: { otp: 'verified' } });
            res.status(200).send('verified_otp');
            //res.redirect       
        }
        else {
            res.status(400).send('incorrect otp')
        }
    } else {
        res.status(400).send("User NBot found")
    }

})

router.get('/change_pass/:id/:newpassword', async (req, res) => {

    const user = await User.findOne({ email: (req.params.id).toLowerCase() });
    const saltRounds = 10;
    if (user) {
        if (user.otp === 'verified') {

            bcrypt.hash(req.params.newpassword, saltRounds, async (err, hash) => {
                if (err) {
                    res.send(err)
                }
                else {
                    const u_pass = await User.updateOne({ email: (req.params.id).toLowerCase() }, { $set: { password: hash } });
                    console.log(u_pass);
                    console.log(hash)
                    res.status(200).send(hash)
                }
            })
        } else {
            res.status(400).send('please verify otp first')
        }
    } else {
        res.status(400).send("User not found")
    }

})

router.get('/allusers', async (req, res) => {
    try {
        let users = await User.find({ verified: 'yes' });
        if (users.length > 0) {
            res.send(users);
        } else {
            res.send({ result: "No users found" })
        }
    } catch (error) {
        console.log(error)
    }
})


module.exports = router;