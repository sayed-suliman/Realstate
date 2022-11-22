const mongoose = require("mongoose")
const voucherSchema = new mongoose.Schema({
    code:String,
    discount:Number,
    length:Number,
    validFrom:Date,
    validTill:Date
},
{
    timestamps:true
}

)
module.exports = mongoose.model("Voucher",voucherSchema)