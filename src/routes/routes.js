const express = require("express")
const router = new express.Router()
const { login, postLogin, signUp } = require("../controllers/auth")
const { forgotPassword, doForgotPassword, doResetPassword, resetPassword } = require("../controllers/reset-password")
const authLocal = require("../middleware/auth-strategy")
const { authenticated, logged_in } = require("../middleware/authentication")
const signUpMiddleware = require("../middleware/authValidation")
const { course, addcourse, courseDetails } = require("../controllers/courses")
const { package, addPackage, packagesDetail } = require("../controllers/package")
const { decodeMsg } = require("../helper/createMsg")
const { checkout, doCheckout } = require("../controllers/checkout")
const { verification, doVerification } = require("../controllers/verification")
const { resendCode } = require("../controllers/resendVerificationCode")
const { payment } = require("../controllers/payment")
const { upload } = require("./../controllers/fileUpload")
const { addChapter, chapterDetail, postChapter, errorMsg } = require("../controllers/chapters")
const { stripeAPI, paypalAPI, doPaypal, stripeSuccess, paypalCapture, stripeTest, stripeTestCancel } = require("../controllers/paymentGateWay")
const { addQuiz, quizDetail } = require("./../controllers/quiz")
const { sendResetEmail, sendVerificationCode } = require("../controllers/mailServices")


router.get("/test", (req, res) => {
    sendVerificationCode('bedike2748@jernang.com', '1234')
    res.render("package")
})
// default route
router.get("/", (req, res) => {
    res.render("package")
})


// login route
router.get("/login", logged_in, login)
// router.post('/login',postLogin)
router.post('/login', authLocal, postLogin)
router.post('/login-ajax', (req, res) => {
    console.log()
})
// Logout
router.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    })
})

// forgot password
router.get('/reset-password', forgotPassword)
router.get('/forgot-password', (req, res) => res.redirect('/reset-password'))
router.post('/forgot-password', doForgotPassword)
// Used in email 
router.get('/user/reset-password', resetPassword)
router.post('/reset-password', doResetPassword)


// checkout post 
router.get('/checkout', checkout)
router.get("/register", (req, res) => res.redirect('/'))
router.post("/register", signUpMiddleware, signUp)
// sign up used because their is registration on checkout
// router.post("/checkout", signUpMiddleware, signUp)
router.get('/checkout2', doCheckout)

// for testing checkout 
router.get("/check", (req, res) => {
    res.render("check", { title: "Checkout" })
})


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
    res.render("dashboard/new-dashboard", {
        title: "Dashboard",
        toast: Object.keys(option).length == 0 ? undefined : option,
    })
})

// verification route
router.get("/verification", verification)
router.post("/verifying", doVerification)
router.get('/resend', resendCode)

// ***********************************
// Testing stripe payment

router.post('/create-payment-intent', stripeTest)
router.post('/cancel-payment-intent', stripeTestCancel)


// ***********************************


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
router.get("/dashboard/add-chapter", addChapter)
router.post("/dashboard/add-chapter", upload.single("courseFile"), postChapter, errorMsg)
// for test below link
router.post("/add-chapter", upload.single("courseFile"), postChapter, errorMsg)
// chapter details 
router.get("/dashboard/chapter-detail", chapterDetail)


// ******************************* Quiz part **************************
// add quiz 
router.get("/dashboard/add-quiz", addQuiz)
// router.post("/dashboard/add-quiz",upload.single("courseFile"),postChapter,errorMsg)

// quiz details 
router.get("/dashboard/quiz-detail", quizDetail)





// old-dashboard
router.get("/old/dashboard", (req, res) => {
    res.render("old-dashboard", { title: "Dashboard" })
})

router.get('/500', (req, res) => res.render('500'))
router.get("*", (req, res) => {
    res.json({
        Error: "404 Page not found"
    })
})


// export all routes
module.exports = router