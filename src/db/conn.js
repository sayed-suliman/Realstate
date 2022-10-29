const mongoose = require("mongoose")
require("dotenv").config()
const uri = process.env.DB_URI
mongoose.connect(uri).then(()=>{
    console.log("Database Connected")
}).catch(err=>{
    console.log("Error",err)
})