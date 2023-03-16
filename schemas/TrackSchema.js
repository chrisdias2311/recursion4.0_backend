const mongoose = require("mongoose");

const trackSchema = mongoose.Schema({
    productId: {
        type: String,
        required: true,
    },
    arrival: {
        type: String,
    },
    ordered: {
        type: String,
    },
    status: {
        type: String,
    },
    location: {
        type: String,
    }
});


// userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

module.exports = mongoose.model('Track', trackSchema);