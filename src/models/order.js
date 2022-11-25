const { default: mongoose, Schema, model } = require("mongoose");

const orderSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    package: {
        type: Schema.Types.ObjectId,
        ref: "Package",
        required: true
    },
    amount: Number,
    verified: Boolean,
    status: String,
    pay_method: String,
    transaction: {
        type: String,
        default: null
    },
    discount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })
const Order = model('order', orderSchema)
module.exports = Order;