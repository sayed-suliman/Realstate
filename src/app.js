const MongoStore = require("connect-mongo")
const cookieParser = require("cookie-parser")
const expressSession = require('express-session')
const express = require("express")
const app = express()
const hbs = require("hbs")
const passport = require("passport")
const path = require("path")
const flash = require('connect-flash')

// Routes
const allRoutes = require("./routes/routes")
require("dotenv").config()
// database connection
require("./db/conn")
// 

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// cookie initialized
app.use(cookieParser(process.env.SECRET))
// session Initialized
app.use(expressSession({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
    maxAge: 60 * 1000,
    store: new MongoStore({
        mongoUrl: process.env.DB_URI
    })
}))

// passport js
app.use(passport.initialize())
app.use(passport.session())

// flash initialized
app.use(flash())
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.toast_success = req.flash('alert_success')
    res.locals.toast_error = req.flash('alert_error')
    res.locals.error = req.flash('error')
    next()
})

// views path
const viewsPath = path.join(__dirname, "./../templates/views")
// partials Path
const partialsPath = path.join(__dirname, "./../templates/partials")
// assets path => css,js and images
const publicPath = path.join(__dirname, "./../public/")

const port = process.env.PORT || 2200
app.set("view engine", "hbs")
app.set("views", viewsPath)
hbs.registerPartials(partialsPath)
app.use(express.static(publicPath))

hbs.registerHelper('ifEquals', function (arg1, arg2, block) {
    if (arg1 == arg2) {
        return block.fn(this)
    }
    return block.inverse(this);
});

app.use(allRoutes)


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})