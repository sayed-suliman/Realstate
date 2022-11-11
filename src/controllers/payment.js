const User = require("../models/users")

module.exports = {
    async payment(req, res) {
        const userID = req.query.user
        if (userID) {
            const user = await User.findById(userID).populate('package');
            if (user) {
                var { price, tax } = user.package;
                user.total = price * ((100 + tax) / 100)

                return res.render('payment', { user })
            }
        }
        return res.redirect('/')
    }
}