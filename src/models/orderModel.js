const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
        ref: "user",
        trim: true
    },
    items:
        [{
            productId: {
                type: ObjectId,
                required: true,
                ref: "product",
                trim: true
            },
            quantity: {
                type: Number,
                required: true
            },
            _id: 0
        }],
    totalPrice: {
        type: Number,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    totalQuantity:{
        type : Number, 
        required: true,
    },
    cancellable : {
        type: Boolean,
        default: true
    },
    status : {
        type : String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    isDeleted:{
        type: Boolean,
        dafault: false
    },
    deletedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);