const express = require("express")
const router = new express.Router()
// main-dashboard
router.get("/dashboard",(req,res)=>{
    res.render("dashboard/new-dashboard")
})
// table
router.get("/dashboard/table",(req,res)=>{
    res.render("dashboard/table")
})
// calender
router.get("/dashboard/calender",(req,res)=>{
    res.render("dashboard/calendar")
})
// search
router.get("/dashboard/search",(req,res)=>{
    res.render("dashboard/search")
})
// search-result
router.get("/dashboard/search/result",(req,res)=>{
    res.render("dashboard/search-result")
})
module.exports = router