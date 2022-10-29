const express = require("express")
const router = new express.Router()
router.get("/dashboard",(req,res)=>{
    res.render("dashboard")
})
module.exports = router