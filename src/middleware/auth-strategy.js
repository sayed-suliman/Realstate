const passport = require("passport");
require('../controllers/passport')

module.exports = passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash:true
})