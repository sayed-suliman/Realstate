const User = require('../models/users')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
const passport = require('passport')

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: "password" }, (email, password, done) => {
    User.findOne({ email }, (err, user) => {
        if (err) {
            return done(err)
        }
        if (!user) {
            return done(null, false, { message: "Credentials doesn't match." })
        }
        bcrypt.compare(password, user.password, (error, match) => {
            if (error) {
                return done(error, false)
            }
            if (!match) {
                return done(null, false, { message: "Credentials doesn't match." })
            }
            return done(null, user)
        })
    })
}))
passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})