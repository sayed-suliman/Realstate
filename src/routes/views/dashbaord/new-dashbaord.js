const express = require("express")
const router = new express.Router()
// main-dashboard
router.get("/dashboard",(req,res)=>{
    res.render("dashboard/new-dashboard",{title:"Dashboard"})
})
// table
router.get("/dashboard/table",(req,res)=>{
    res.render("dashboard/table",{title:"Dashboard | Table"})
})
// calender
router.get("/dashboard/calendar",(req,res)=>{
    res.render("dashboard/calendar",{title:"Dashboard | Calendar"})
})
// search
router.get("/dashboard/search",(req,res)=>{
    res.render("dashboard/search",{title:"Dashboard | Search"})
})
// search-result
router.get("/dashboard/search/result",(req,res)=>{
    res.render("dashboard/search-result",{title:"Dashboard | Search Result"})
})

// mailbox =>

// inbox
router.get("/dashboard/inbox",(req,res)=>{
    res.render("dashboard/mailbox/inbox",{title:"Dashboard | Inbox"})
})
// read
router.get("/dashboard/read",(req,res)=>{
    res.render("dashboard/mailbox/read",{title:"Dashboard | Read"})
})
// compose
router.get("/dashboard/compose",(req,res)=>{
    res.render("dashboard/mailbox/compose",{title:"Dashboard | Compose"})
})

// examples =>
// contact-us
router.get("/dashboard/contact-us",(req,res)=>{
    res.render("dashboard/examples/contact-us",{title:"Dashboard | Contact-Us"})
})
// contacts
router.get("/dashboard/contacts",(req,res)=>{
    res.render("dashboard/examples/contacts",{title:"Dashboard | Contact"})
})
// invoice-print
router.get("/dashboard/invoice-print",(req,res)=>{
    res.render("dashboard/examples/invoice-print",{title:"Dashboard | Invoice Print"})
})
// invoice
router.get("/dashboard/invoice",(req,res)=>{
    res.render("dashboard/examples/invoice",{title:"Dashboard | Invoice"})
})
// language-menu
router.get("/dashboard/language-menu",(req,res)=>{
    res.render("dashboard/examples/language-menu",{title:"Dashboard | Language Menu"})
})
// profile
router.get("/dashboard/profile",(req,res)=>{
    res.render("dashboard/examples/profile",{title:"Dashboard | Profile"})
})
// profile-add
router.get("/dashboard/project-add",(req,res)=>{
    res.render("dashboard/examples/project-add",{title:"Dashboard | Add Project"})
})
// project-detail
router.get("/dashboard/project-detail",(req,res)=>{
    res.render("dashboard/examples/project-detail",{title:"Dashboard | Project Detail"})
})

module.exports = router