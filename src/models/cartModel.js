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
    items: [{
        productId: { type: ObjectId, ref: 'product', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
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