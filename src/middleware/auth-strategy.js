const passport = require("passport");
require('../controllers/passport')

module.exports = passport.authenticate('local', {
    // back mean to the same page
    // also use link i.e /login
    failureRedirect: 'back',
    failureFlash: true
})