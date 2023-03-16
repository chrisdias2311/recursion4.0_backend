const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    ownerId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    bookingStatus: {
        type: String,
    },
    sellingDate: {
        type: String,
    },
    productImage: {
        type: String,
        // required: true,
        // required: true
    },
    quantity: {
        type: Number,
    },
    targetgender: {
        type: String,
    },
    targetage: {
        type: String,
    }
});


// userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

module.exports = mongoose.model('Product', productSchema);