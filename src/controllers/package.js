const Package = require("../models/package")

module.exports = async (req, res) => {
    const package = await Package(req.body)
    package.save().then(package => {
        req.flash('alert_success', "The package has been created.")
        res.redirect('/dashboard')
    }).catch(e => {
        console.log(e)
    })
}