const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const multer = require("multer");
const User = require('../schemas/Userschema')
const Product = require('../schemas/ProductSchema')
const Transaction = require('../schemas/TransactionSchema')
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { application } = require('express');
const jwt = require('jsonwebtoken');
const multer = require('../middlewares/multer')
const sendMail = require('../mailhandelling/book')
const Retailer = require('../schemas/SellerSchema');
const { read } = require('fs');

const secretKey = "secretKey";

const URL = `http://localhost:5000`



router.post("/addproduct", multer.upload.single("file"), async (req, res) => {
    try {
        console.log(req.file)
        //Will send the email

        const newProduct = new Product({
            ownerId: req.body.ownerId,
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            price: req.body.price,
            bookingStatus: 'available',
            sellingDate: (new Date).toString(),
            productImage: `${URL}/api/image/${req.file.filename}`,
            quantity: req.body.quantity,
            targetgender: req.body.targetgender,
            targetage: req.body.targetage
        });
        let productId;
        const saved = await newProduct.save(function (err, product) {
            if (err) {
                console.log(err);
                res.send('bad request').status(400)

            }
            else {
                let productId = product._id.toString();
                //let slice = productId.slice(14, 38);
                res.send(productId).status(200);
                console.log(productId);

            }
        });
    } catch (error) {
        console.log(error);
        res.send(error).status(400);
    }
})

router.get('/allproducts', async (req, res) => {
    try {
        let products = await Product.find({ bookingStatus: 'available' });
        if (products.length > 0) {
            products.reverse();
            res.send(products);
        } else {
            res.send({ result: "No products found" })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/productdetails', async (req, res) => {
    try {
        let product = await Product.findOne({ _id: mongoose.Types.ObjectId(req.body.id) })
        if (product) {
            res.send(product).status(200);
        }
        else {
            res.send('product dosnt exist').status(400)

        }
    } catch (error) {
        res.send(error).status(500)
        console.log(error)
    }
}
)

router.post('/myproducts', async (req, res) => {
    try {
        // console.log(req.body.ownerId)
        let products = await Product.find({ ownerId: req.body.ownerId, bookingStatus: 'available' });
        if (products.length > 0) {
            products.reverse()
            res.send(products);
        } else {
            res.send({ result: "No products found" })
        }
    } catch (error) {
        console.log(error)
    }
})



router.post('/bookedproducts', async (req, res) => {
    try {
        let products = await Product.find({ bookedBy: req.body.id });
        if (products.length > 0) {
            res.send(products);
        } else {
            res.send({ result: "No products found" })
        }
    } catch (error) {
        console.log(error)
    }
})

router.post('/bookproduct', async (req, res) => {
    try {

        let toDelete = await Product.findOne({ _id: mongoose.Types.ObjectId(req.body.id) });
        // let gfs = multer.gfs.grid
        let filename = toDelete.productImage

        let temp = []
        temp = filename.split("/")
        console.log(temp)
        let removingFile = temp[temp.length - 1]
        // user_icon_1662560350693undefined
        // console.log(removingFile);
        let gridfsBucket;
        console.log(removingFile)
        try {
            gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connections[0].db, {
                bucketName: "uploads",
            });

            const img = await gridfsBucket.find({ filename: removingFile }).toArray();
            img.map(async (doc) => {
                const del = await gridfsBucket.delete(doc._id)
                console.log(del)
            })

            let booked = await Product.updateOne(
                { _id: mongoose.Types.ObjectId(req.body.id) },
                {
                    $set: {
                        bookingStatus: 'booked',
                        bookedBy: req.body.buyerId
                    }
                }
            )
            //res.send('request has been processed');

        } catch (error) {
            console.log("Not deleted")
        }



        try {
            const Seller = await Retailer.findOne({ _id: mongoose.Types.ObjectId(req.body.sellerId) })
            const SellerName = await Seller;

            let transDate = (new Date).toString()
            let slicedDate = transDate.substring(0, 16);



            const newTransaction = new Transaction({
                productId: req.body.id,
                productName: req.body.productName,
                soldBy: req.body.sellerId,
                broughtBy: req.body.buyerId,
                sellerName: SellerName.firstname,
                buyerName: req.body.buyerName,
                date: slicedDate,
                transactionType: 'booked'
            })

            const saved = await newTransaction.save();
            res.send(saved);
            console.log("Saved: ", saved);
        } catch (error) {
            console.log("Error new trans: ", error)
        }

        try {
            const Seller = await Retailer.findOne({ _id: mongoose.Types.ObjectId(req.body.sellerId) })
            //const buyer = await User.findOne({_id:mongoose.Types.ObjectId(req.body.buyerId)})
            let booked = await Product.updateOne(
                { _id: mongoose.Types.ObjectId(req.body.id) },
                {
                    $set: {
                        bookingStatus: 'booked',
                        bookedBy: req.body.buyerId
                    }
                }
            )
            let product = await Product.findOne({ _id: mongoose.Types.ObjectId(req.body.id) })
            sendMail.sendBooked(product.name, Seller.email)
            console.log(booked)
            // res.status(200).send("Product deleted successfully!")
        } catch (error) {
            console.log("Error: ", error)
        }


    } catch (error) {
        console.log("The error: ", error)
        res.status(400).send("UNSUCCESSFUL")
    }
})


router.post('/downloadproduct', async (req, res) => {

    try {
        const Seller = await Retailer.findOne({ _id: mongoose.Types.ObjectId(req.body.sellerId) })
        const SellerName = await Seller;
        console.log("SELLERNAME:",
            SellerName)

        let transDate = (new Date).toString()
        let slicedDate = transDate.substring(0, 16);



        const newTransaction = new Transaction({
            productId: req.body.id,
            productName: req.body.productName,
            soldBy: req.body.sellerId,
            broughtBy: req.body.buyerId,
            sellerName: SellerName.firstname,
            buyerName: req.body.buyerName,
            date: slicedDate,
            transactionType: 'tried to access'
        })
        const saved = await newTransaction.save();
        res.send(saved);
        console.log("Saved: ", saved);
    } catch (error) {
        console.log("Error new trans: ", error)
    }
})



// router.post('/productdetails', async (req, res) => {
//     try {
//         let product = await Product.findOne({ _id: mongoose.Types.ObjectId(req.body.productid) });
//         if (product) {
//             res.send(product)
//         } else {
//             res.send("No product found")
//         }
//     } catch (error) {
//         console.log(error)
//         res.send(error)
//     }
// })


router.post('/updateproduct', async (req, res) => {
    try {
        console.log(req.body)
        let updated = await Product.updateOne(
            { _id: mongoose.Types.ObjectId(req.body.productid) },
            {
                $set: {
                    name: req.body.name,
                    description: req.body.description,
                    category: req.body.category,
                    price: req.body.price,
                    link: req.body.link
                }
            }
        )
        console.log(updated)
        res.send(updated)
    } catch (error) {
        console.log(error)
    }
})

router.post('/deleteproduct', async (req, res) => {
    let gridfsBucket;
    let removingFile;
    try {
        let toDelete = await Product.findOne({ _id: mongoose.Types.ObjectId(req.body.id) });

        let filename = toDelete.productImage;

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
        try {
            let deleted = await Product.deleteOne({ _id: mongoose.Types.ObjectId(req.body.id) });
        } catch (err) {
            console.log(err)
        } console.log("Done")
        res.send('request has been processed');

    } catch (error) {
        console.log("Not Done")
    }

})


router.post('/selectproduct', async (req, res) => {
    let Find = await Product.findOne({ _id: mongoose.Types.ObjectId(req.body.id) });
    if (Find) {
        const update = await Product.updateOne({ _id: mongoose.Types.ObjectId(req.body.id) }, { $set: { quantity: (Find.quantity - 1) } })
        let tracker;
        res.send(update).status(200)
        try {
            let arrival_date = (new Date() + 2).toString()

            let slicedarrival = arrival_date.substring(0, 16);
            let transDate = (new Date).toString()
            let slicedDate = transDate.substring(0, 16);
            const newTrack = new Track(
                {
                    productId: req.body.productId,
                    arrival: slicedarrival,
                    ordered: slicedDate,
                    status: 'Ordered',
                    location: req.body.location,
                    buyeremail: req.body.buyeremail,
                }
            )
            const saved = await newTrack.save((error, track) => {
                if (error) {
                    console.log(error);
                    res.send(400, 'bad request');
                }

                else {
                    res.send('tracker set').status(200);
                }
            });
        } catch (error) {
            console.log(error)
            res.send('internal error').status(500);
        }
    }

    else {
        res.send('product dosnt exist').status(400)
    }
})

module.exports = router;