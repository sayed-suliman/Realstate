// for authenticated user only
var authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        //this used for to avoid going back when user logged out 
        res.set('Cache-Control', 'no-cache,private,no-store,must-revalidate,post-check=0,pre-check=0')
        // pass auth user to all view when used this middleware
        res.locals.user = req.user
        next()
    } else {
        req.flash("error", "Please! Login to continue.")
        res.redirect('/login')
    }
}
// redirect to dashboard when user is logged in 
var logged_in = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard')
    } else {
        next()
    }
}

module.exports = {authenticated,logged_in}