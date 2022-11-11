const OTP = require("../models/otp");
const Package = require("../models/package");
const User = require("../models/users");

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
    },
    async doVerification(req, res) {
        const { val1, val2, val3, val4, email, packageID } = req.body;
        const code = val1 + val2 + val3 + val4
        console.log(code)
        const otp = await OTP.findOne({ otp: code });
        if (!otp) {
            const package = await Package.findById(packageID);
            var { price, tax } = package;
            package.total = price * ((100 + tax) / 100)//total price with tax
            return res.render('verification', {
                title: "Verification",
                package, email, err:"OTP incorrect or expired."
            })
        }
        await User.findOneAndUpdate({email},{verify:true})
        await otp.deleteOne();
        res.send("Verified")
    }
}