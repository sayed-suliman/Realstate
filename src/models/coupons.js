const mongoose = require("mongoose")
const voucherSchema = new mongoose.Schema({
    code: String,
    discount: Number,
    length: Number,
    validFrom: Date,
    validTill: Date
},
    {
        timestamps: true
    }

)
const Coupon = mongoose.model("coupon", voucherSchema)
module.exports = Coupon