const generateVoucher = require("voucher-code-generator")
const Coupon = require("../models/coupons")
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
module.exports = {
    async getCoupon(req, res) {
        try {
            var msgToken = req.query.msg;
            var option = {}
            if (msgToken) {
                var msg = decodeMsg(msgToken)
                option = msg
            }
            res.render("dashboard/examples/coupons/add-coupon", {
                title: "Dashboard | Add Coupon",
                toast: Object.keys(option).length == 0 ? undefined : option
            })
        } catch (e) {
            res.status(404).json({
                err: e.message,
                status: 404
            })
        }
    },
    async postCoupon(req, res) {
        try {
            console.log(req.body.validFrom)
            var data = await req.body
            data.length = data.length || -1
            let codes = await generateVoucher.generate({
                length: 10,
                pattern: data.pattern
            })

            const couponAdded = await Coupon({
                code: codes[0],
                discount: data.discount,
                length: data.length,
                validFrom: data.validFrom,
                validTill: data.validTill
            })
            await couponAdded.save()

            var msg = await encodeMsg("Coupon code has been generated, Please check Coupon Details Page")
            return res.redirect("/dashboard/add-coupon?msg=" + msg)
        } catch (e) {
            console.log(e.message)
            var msg = await encodeMsg("Sorry!" + e.message, 'danger')
            return res.redirect("/dashboard/add-coupon?msg=" + msg)
            // res.status(404).json({
            //     status:404,
            //     error:e.message
            // })
        }
    },
    async detailsCoupon(req, res) {
        try {
            var msgToken = req.query.msg;
            const coupons = await Coupon.find().sort({ createdAt: 1 })
            var option = {}
            if (msgToken) {
                var msg = decodeMsg(msgToken)
                option = msg
            }
            // res.json({
            //     coupons,
            //     status:403
            // })  
            res.render("dashboard/examples/coupons/coupons-detail", {
                title: "Dashboard | Coupons Detail",
                coupons,
                toast: Object.keys(option).length == 0 ? undefined : option

            })
        } catch (e) {
            res.json({
                msg: e.message,
                status: 403
            })
        }
    },
    async deleteCoupon(req, res) {
        try {
            let couponId = req.query.vId
            const coupon = await Coupon.findById(couponId)
            await coupon.remove()
            var msg = encodeMsg("Coupon Delete Successfully", "danger")
            return res.redirect("/dashboard/coupon-detail?msg=" + msg)

        } catch (e) {
            res.render("500")
        }
    },
    async couponAPI(req, res) {
        const { code } = req.body;
        console.log(code)
        var coupon = await Coupon.findOne({ code: code, length: { $ne: 0 } });
        coupon = coupon.toObject()
        delete coupon.length
        delete coupon.validFrom
        delete coupon.validTill
        delete coupon.createdAt
        delete coupon.updatedAt

        console.log(coupon)

        if (coupon) {
            return res.send({ success: { msg: `${coupon.discount}% discount is applied on your payment.`, coupon } })
        }
        res.send({ error: "Coupon Code doesn't exist." })
    }
}