const express = require("express")
const router = new express.Router()
router.get("/old/dashboard",(req,res)=>{
    res.render("dashboard",{title:"Dashboard"})
})
module.exports = router