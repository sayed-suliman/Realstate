const express = require("express")
const app = express()
const hbs = require("hbs")
const path = require("path")
require("dotenv").config()
// database connection
require("./db/conn")

// 
app.use(express.json())
app.use(express.urlencoded({extended:true})) 

// Routes
// route of dashboard
const dashboardRoute = require("./routes/views/dashboard")
app.use(dashboardRoute)
// login route
const loginRoute = require("./routes/views/login")
app.use(loginRoute)

// Add User
const addUser = require("./routes/crud/add-user")
app.use(addUser)
// Login user
const loginUser = require("./routes/crud/login-user")
app.use(loginUser)

// dashbaord routes
const dashbaordRoutes = require("./routes/views/dashbaord/new-dashbaord")
app.use(dashbaordRoutes)


// end routes

// views path
const viewsPath = path.join(__dirname,"./../templates/views")
// partials Path
const partialsPath = path.join(__dirname,"./../templates/partials")
// assets path => css,js and images
const publicPath = path.join(__dirname,"./../public/")

const port = process.env.PORT || 2200
app.set("view engine","hbs")
app.set("views",viewsPath)
hbs.registerPartials(partialsPath)
app.use(express.static(publicPath))


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})