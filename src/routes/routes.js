const express = require("express")
const router = new express.Router()
const { login, postLogin, signUp } = require("../controllers/auth")
const authLocal = require("../middleware/auth-strategy")
const { authenticated, logged_in } = require("../middleware/authentication")
const signUpMiddleware = require("../middleware/authValidation")
const { course, addcourse, courseDetails } = require("../controllers/courses")
const { package, addPackage, packagesDetail } = require("../controllers/package")
const { decodeMsg } = require("../helper/createMsg")
const { checkout, doCheckout } = require("../controllers/checkout")
const { verification, doVerification } = require("../controllers/verification")
const { resendCode } = require("../controllers/resendCode")
const { payment } = require("../controllers/payment")
const { upload } = require("./../controllers/fileUpload")
const { addChapter, chapterDetail, postChapter } = require("../controllers/chapters")
const { stripeAPI, paypalAPI, doPaypal, stripeSuccess, paypalCapture } = require("../controllers/paymentGateWay")



// default route
router.get("/", (req, res) => {
    res.render("package")
})


// login route
router.get("/login", logged_in, login)
// router.post('/login',postLogin)
router.post('/login', authLocal, postLogin)
router.post('/login-ajax', (req,res)=>{
    console.log()
})
// Logout
router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    })
})
// checkout post 


router.get('/checkout', checkout)
// sign up used because their is registration on checkout
router.post("/checkout", signUpMiddleware, signUp)
router.get('/checkout2', doCheckout)


// middleware for all dashboard route
router.use('/dashboard', authenticated)

// main-dashboard
router.get("/dashboard", (req, res) => {
    var msgToken = req.query.msg;
    var option = {}
    if (msgToken) {
        var msg = decodeMsg(msgToken)
        option = msg
    }
    res.render("dashboard/new-dashboard", { title: "Dashboard", toast: Object.keys(option).length == 0 ? undefined : option })
})

// verification route
router.get("/verification", verification)
router.post("/verifying", doVerification)
router.get('/resend', resendCode)

router.get('/payment', payment)
router.post('/stripe', stripeAPI)
router.get('/paypal', paypalAPI)
router.post('/paypal-payment', doPaypal)
router.post('/paypal-capture', paypalCapture)
router.get('/success', stripeSuccess)

// table
router.get("/dashboard/table", (req, res) => {
    res.render("dashboard/table", { title: "Dashboard | Table" })
})
// calender
router.get("/dashboard/calendar", (req, res) => {
    res.render("dashboard/calendar", { title: "Dashboard | Calendar" })
})
// search
router.get("/dashboard/search", (req, res) => {
    res.render("dashboard/search", { title: "Dashboard | Search" })
})
// search-result
router.get("/dashboard/searchResult", (req, res) => {
    res.render("dashboard/search-result", { title: "Dashboard | Search Result" })
})

// mailbox =>

// inbox
router.get("/dashboard/inbox", (req, res) => {
    res.render("dashboard/mailbox/inbox", { title: "Dashboard | Inbox" })
})
// read
router.get("/dashboard/read", (req, res) => {
    res.render("dashboard/mailbox/read", { title: "Dashboard | Read" })
})
// compose
router.get("/dashboard/compose", (req, res) => {
    res.render("dashboard/mailbox/compose", { title: "Dashboard | Compose" })
})

// examples =>
// contact-us
router.get("/dashboard/contact-us", (req, res) => {
    res.render("dashboard/examples/contact-us", { title: "Dashboard | Contact-Us" })
})
// contacts
router.get("/dashboard/contacts", (req, res) => {
    res.render("dashboard/examples/contacts", { title: "Dashboard | Contact" })
})
// invoice-print
router.get("/dashboard/invoice-print", (req, res) => {
    res.render("dashboard/examples/invoice-print", { title: "Dashboard | Invoice Print" })
})
// invoice
router.get("/dashboard/invoice", (req, res) => {
    res.render("dashboard/examples/invoice", { title: "Dashboard | Invoice" })
})
// language-menu
router.get("/dashboard/language-menu", (req, res) => {
    res.render("dashboard/examples/language-menu", { title: "Dashboard | Language Menu" })
})
// profile
router.get("/dashboard/profile", (req, res) => {
    res.render("dashboard/examples/profile", { title: "Dashboard | Profile" })
})
// package
router.get("/dashboard/add-package", package)
router.post('/dashboard/add-package', addPackage)
router.get("/dashboard/edit-package/:id", package)
router.get("/dashboard/package-detail", packagesDetail)

// course-add
router.post("/dashboard/add-course", addcourse)



// add course
// render of course add
router.get("/dashboard/add-course", course)

// course-detail
router.get("/dashboard/course-detail", courseDetails)

// add chapter 
// render of course add
router.get("/dashboard/add-chapter", addChapter)
// chapter details 
// render of course add
router.get("/dashboard/chapter-detail", chapterDetail)
router.post("/add-chapter", upload.single("courseFile"), postChapter)



// *****************************************************************

// not completed yet just for testing courses

// test addcourse with pdf
// router.post("/add-course",upload.single("course_file"), addcourse)
// readpdf
const PDF = require("./../models/courses")
router.get("/pdf-read", async (req, res) => {
    const pdfData = await PDF.findById("6371df52e20dae60826d9b6a")
    const decode = pdfData.pdffile.toString
    res.send(pdfData.pdffile)
})
// ***************************************************************************



// old-dashboard
router.get("/old/dashboard", (req, res) => {
    res.render("old-dashboard", { title: "Dashboard" })
})


router.get("*", (req, res) => {
    res.json({
        Error: "404 Page not found"
    })
})


// export all routes
module.exports = router