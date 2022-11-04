const express = require("express")
const app = express()
const hbs = require("hbs")
const path = require("path")
// Routes
const allroutes = require("./routes/routes")
require("dotenv").config()
// database connection
require("./db/conn")
// 

app.use(express.json())
app.use(express.urlencoded({extended:true})) 

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
app.use(allroutes)


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})