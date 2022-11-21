const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Package = require("../models/package")
module.exports = {
    package(req, res) {
        if (req.params.id) {
            return res.render("dashboard/examples/packages/add-package", { title: req.params.id + "| Edit Package" })
        }
        return res.render("dashboard/examples/packages/add-package", { title: "Dashboard | Add Package" })
    },
    async addPackage(req, res) {
        try {
            const package = await Package(req.body).save();
            if (package) {
                var msg = encodeMsg('The package has been created')
                return res.redirect('/dashboard?msg=' + msg)
            }
        } catch (error) {
            var msg = encodeMsg('Some error while creating package.', 'danger', '500')
            return res.redirect('/dashboard?msg=' + msg)
        }
    },
    async packagesDetail(req, res) {
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        const packages = await Package.find();
        res.render("dashboard/examples/packages/package-detail", {
            title: "Dashboard | Package Detail",
            packages,
            toast: Object.keys(option).length == 0 ? undefined : option
        })
    },
    async editPackage(req, res) {

        try {
            let packageId = req.query.pId
            const package = await Package.findById(packageId)
            console.log(package)
            // const packages = await Package.find({ status: "publish" })
            res.render("dashboard/examples/packages/package-edit",
                { title: "Dashboard | Edit Package", package }
            )
        } catch (e) {
            // res.status(404).json({
            //     error: e.message,
            //     status: 404
            // })
            res.render("500")
        }
    },
    async updatePackage(req, res) {
        try {
            const data = req.body
            const package = await Package.findById(req.query.pId)
            // const packageId = await Package.findOne({ name: data.package })
            await package.updateOne(data)
            // res.json({
            //     data:package
            // })
            // await course.updateOne({
            //     name: data.name,
            //     description: data.description,
            //     status: data.status,
            //     package: packageId._id,
            //     price: data.price
            // })
            var msg = encodeMsg("Package Updated")
            return res.redirect("/dashboard/package-detail?msg=" + msg)
        } catch (e) {
            res.render("404")
        }
    },
    async deletePackage(req,res) {
        try{
            let packageId = req.query.pId
            const package = await Package.findById(packageId)
        }catch (e){
            res.render("404")
        }
    }
}