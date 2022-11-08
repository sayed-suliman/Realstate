const { encodeMsg } = require("../helper/createMsg");
const Package = require("../models/package")
module.exports = {
    package(req, res) {
        res.render("dashboard/examples/add-package", { title: "Dashboard | Add Package" })
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
    }
}