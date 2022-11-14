const OTP = require("../models/otp");
const User = require("../models/users");
const url = require('url')

module.exports = {
    async verification(req, res) {
        try {
            var { user: userID } = req.query;
            if (userID) {
                const user = await User.findById(userID).populate('package');
                // if user is verified already then redirect to payment
                if (user.verified) {
                    return res.redirect(url.format({
                        pathname: '/payment',
                        query: {
                            user: user._id.toString()
                        }
                    }))
                } else {
                    var { price, tax } = user.package;
                    user.total = price * ((100 + tax) / 100)//total price with tax

                    return res.render('verification', {
                        title: "Verification",
                        user
                    })
                }
            }
            return res.redirect('/')
        } catch (error) {
            console.log(error.message)
            return res.redirect('/')
        }
    },
    async doVerification(req, res) {
        const { val1, val2, val3, val4, userID } = req.body;
        const code = val1 + val2 + val3 + val4
        const otp = await OTP.findOne({ otp: code });
        if (!otp) {
            const user = await User.findById(userID).populate('package');
            var { price, tax } = user.package;

            user.total = price * ((100 + tax) / 100)//total price with tax

            return res.render('verification', {
                title: "Verification",
                user, err: "OTP incorrect or expired."
            })
        }
        const user = await User.findByIdAndUpdate(userID, { verify: true })
        await otp.deleteOne();
        res.redirect(url.format({
            pathname: '/payment',
            query: {
                user: user._id.toString()
            }
        }))
    }
}