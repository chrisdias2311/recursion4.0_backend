const express = require('express');
const router = express.Router();

const Track = require('../schemas/TrackSchema');


router.post('/update', async (req, res) => {
    try {
        const FindProduct = await Track.findOne({ productId: req.body.product })
        if (FindProduct) {
            const UpdateProduct = await Track.updateOne({ productId: req.body.product }, { $set: { status: req.body.status } })
            console.log(UpdateProduct);
            res.status(200).send('product updated');
        }
        else {
            res.send('product dosnt exist').status(400);
        }
    } catch (error) {
        res.status(500).send('internal error');
    }
})

router.post('/getstatus', async (req, res) => {
    try {
        const FindProduct = await Track.findOne({ productId: req.body.product })
        if (FindProduct) {
            res.status(200).send(FindProduct);
        }
    }
    catch (error) {
        res.status(500).send('internal error');

    }
})


router.post('/settracker', async (req, res) => {
    try {
        const tracker = await Track.findOne({ productId: req.body.productId })
    } catch (error) {
        console.log(error);
        res.send('internal error').status(500);
    }
    if (tracker) {
        console.log(tracker)
        res.status(400).send('package is already bieng tracked');
        return
    } else {
        try {

            const newTrack = new Track(
                {
                    productId: req.body.productId,
                    arrival: req.body.arrival,
                    ordered: req.body.data,
                    status: req.body.status
                }
            )
            const saved = await newTrack.save((error, track) => {
                if (error) {
                    console.log(error);
                    res.send(400, 'bad request');
                }

                else {
                    res.send(track)
                }
            });
        } catch (error) {
            console.log(error)
            res.send('internal error').status(500);
        }
    }
})


router.post('/getalltrackers', async (req, res) => {
    try {
        const trackers = await Track.Find({})
        if (trackers.length > 0) {
            trackers.reverse();
            res.send(trackers).status(200)
        }
        else {
            res.send({ result: "no products to track" })
        }
    } catch (error) {
        console.log(error)
        res.send('internal error').status(500);
    }
})

module.exports = router;