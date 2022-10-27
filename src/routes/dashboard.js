const express = require("express")
const router = new express.Router()
router.get("/dashboard",(req,res)=>{
    res.render("login")
})
module.exports = router