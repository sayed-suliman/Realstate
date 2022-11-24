const generateVoucher = require("voucher-code-generator")
const Voucher = require("./../models/vouchers")
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
module.exports = {
    async getVoucher(req, res) {
        try {
            var msgToken = req.query.msg;
            var option = {}
            if (msgToken) {
                var msg = decodeMsg(msgToken)
                option = msg
            }
            res.render("dashboard/examples/vouchers/add-voucher", {
                title: "Dashboard | Add Voucher",
                toast: Object.keys(option).length == 0 ? undefined : option
            })
        } catch (e) {
            res.status(404).json({
                err: e.message,
                status: 404
            })
        }
    },
    async postVoucher(req, res) {
        try {
            var data = await req.body
            data.length = data.length || -1
            let codes = await generateVoucher.generate({
                length: 10,
                pattern: data.pattern
            })
            const voucherAdded = await Voucher({
                code: codes[0],
                discount: data.discount,
                length: data.length,
                validFrom: data.validFrom,
                validTill: data.validTill
            })
            await voucherAdded.save()
            
            var msg = await encodeMsg("Voucher code has been generated, Please check Voucher Details Page")
            return res.redirect("/dashboard/add-voucher?msg=" + msg)
        } catch (e) {
            var msg = await encodeMsg("Sorry!" + e.message, 'danger')
            return res.redirect("/dashboard/add-voucher?msg=" + msg)
            // res.status(404).json({
            //     status:404,
            //     error:e.message
            // })
        }
    },
    async detailsVoucher(req, res) {
        try {
            var msgToken = req.query.msg;
            const vouchers = await Voucher.find().sort({ createdAt: 1 })
            var option = {}
            if (msgToken) {
                var msg = decodeMsg(msgToken)
                option = msg
            }
            // res.json({
            //     vouchers,
            //     status:403
            // })  
            res.render("dashboard/examples/vouchers/vouchers-detail", {
                title: "Dashboard | Vouchers Detail",
                vouchers,
                toast: Object.keys(option).length == 0 ? undefined : option

            })
        } catch (e) {
            res.json({
                msg: e.message,
                status: 403
            })
        }
    },
    async deleteVoucher(req, res) {
        try {
            let voucherId = req.query.vId
            const voucher = await Voucher.findById(voucherId)
            await voucher.remove()
            var msg = encodeMsg("Voucher Delete Successfully", "danger")
            return res.redirect("/dashboard/voucher-detail?msg=" + msg)

        } catch (e) {
            res.render("500")
        }
    }
}