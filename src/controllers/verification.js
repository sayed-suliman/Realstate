const Package = require("../models/package");

module.exports = {
    async verification(req, res) {
        var { package: packageID, user } = req.query;
        console.log(packageID, user)
        if (packageID && user) {
            const package = await Package.findById(packageID);
            var { price, tax } = package;
            package.total = price * ((100 + tax) / 100)//total price with tax
            return res.render('verification', {
                title: "Verification",
                package, email: user
            })
        }
        return res.redirect('/')
    }
}