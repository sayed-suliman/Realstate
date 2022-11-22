module.exports = {
    getVoucher(req,res){
        res.render("dashboard/examples/vouchers/add-voucher")
    },
    async detailsVoucher(req,res){
        res.render("dashboard/examples/vouchers/vouchers-detail")
    }
}