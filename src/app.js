const express = require("express")
const app = express()
const hbs = require("hbs")
const path = require("path")

// route of dashboard
const dashboardRoute = require("./routes/dashboard")
app.use(dashboardRoute)

// views path
const viewsPath = path.join(__dirname,"./../templates/views")
// partials Path
const partialsPath = path.join(__dirname,"./../templates/partials")
// assets path => css,js and images
const publicPath = path.join(__dirname,"./../public/")

const port = process.env.PORT || 2200
// app.use(express.json())
app.set("view engine","hbs")
app.set("views",viewsPath)
hbs.registerPartials(partialsPath)
app.use(express.static(publicPath))
// app.use(express.urlencoded({extended:true}))


app.listen(port,()=>{
    console.log(`${port} Is Running`)
})