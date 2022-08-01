const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        ref: "user",
        trim: true,
        unique: true
    },
    items: /*[Object],*/[{
        productId: {type: ObjectId, ref: 'Product', required: true},
        quantity: {type: Number, required: true, min: 1}
      }],
  
        // [{
        //     productId: {
        //         type: ObjectId,
        //         required: true,
        //         ref: "product",
        //         trim: true
        //     },
        //     quantity: {
        //         type: Number,
        //         required: true
        //     },
        // }],
    totalPrice: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('cart', cartSchema);