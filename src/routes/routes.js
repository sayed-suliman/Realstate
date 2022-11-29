const express = require("express")
const router = new express.Router()
const { login, postLogin, signUp } = require("../controllers/auth")
const { forgotPassword, doForgotPassword, doResetPassword, resetPassword } = require("../controllers/reset-password")
const authLocal = require("../middleware/auth-strategy")
const { authenticated, logged_in, isStudent, isAdmin, verifiedAndPaid } = require("../middleware/authentication")
const signUpMiddleware = require("../middleware/authValidation")
const { course, addcourse, courseDetails, deleteCourse, editCourse, updateCourse } = require("../controllers/courses")
const { package, addPackage, packagesDetail, editPackage, updatePackage, deletePackage } = require("../controllers/package")
const { checkout, doCheckout } = require("../controllers/checkout")
const { verification, doVerification } = require("../controllers/verification")
const { resendCode } = require("../controllers/resendVerificationCode")
const { payment } = require("../controllers/payment")
const { upload } = require("./../controllers/fileUpload")
const { addChapter, chapterDetail, postChapter, errorMsg, deleteChapter, editChapter, updateChapter } = require("../controllers/chapters")
const { paypalAPI, paymentSuccess, stripeIntent, stripeIntentCancel } = require("../controllers/paymentGateWay")
const { addQuiz, quizDetail, postQuiz, editQuiz, updateQuiz } = require("./../controllers/quiz")
const { sendVerificationCode } = require("../controllers/mailServices")
const { getCoupon, detailsCoupon, postCoupon, deleteCoupon, couponAPI } = require("../controllers/coupons")
const { dashboard } = require("../controllers/dashboard")
const { users } = require("../controllers/users")
const {order,orderCourse} = require("./../controllers/order")
const Package = require("../models/package")
const { viewCourse } = require("../controllers/view-course")


router.get("/test", (req, res) => {
    sendVerificationCode('sulimank418@gmail.com', '1234')
    res.render("package")
})
// default route
router.get("/", async (req, res) => {
    const msg = req.query.msg;
    const type = req.query.type;
    const packages = await Package.find({ status: "publish" });
    res.render("package", { packages, msg: { text: msg, type } })
})


// login route
router.get("/login", logged_in, login)
// router.post('/login',postLogin)
router.post('/login', verifiedAndPaid, authLocal, postLogin)
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
router.get("/dashboard", dashboard)

// verification route
router.get("/verification", verification)
router.post("/verifying", doVerification)
router.get('/resend', resendCode)

// payment routes
router.get('/payment', payment)
router.post('/create-payment-intent', stripeIntent)
router.post('/cancel-payment-intent', stripeIntentCancel)
router.post('/paypal', paypalAPI)
router.get('/success', paymentSuccess)
router.post('/check-coupon', couponAPI)


router.get('/dashboard/view-course/', (req, res) => res.redirect('/dashboard'))
router.get('/dashboard/view-course/:id', viewCourse)
router.get('/dashboard/view-chapter', (req, res) => {
    res.render('dashboard/student/view-chapter', {
        title: "View Chapter"
    })
})
// contact-us
router.get("/dashboard/contact-us", isStudent, (req, res) => {
    res.render("dashboard/examples/contact-us", { title: "Dashboard | Contact-Us" })
})
// users
router.get("/dashboard/users", users)


// ****************************** Packages
//add package
router.get("/dashboard/add-package", isAdmin, isAdmin, package)
router.post('/dashboard/add-package', isAdmin, addPackage)
// package details
router.get("/dashboard/package-detail", isAdmin, packagesDetail)
router.get("/dashboard/package-detail/edit-package", isAdmin, editPackage)
router.post("/dashboard/package-detail/update-package", isAdmin, updatePackage)
// delete package
router.get("/dashboard/package-detail/delete-package", isAdmin, deletePackage)



//  ******************************* Courses
// add course
// render of course add
router.get("/dashboard/add-course", course)
// course-add post
router.post("/dashboard/add-course", addcourse)

// course-detail
router.get("/dashboard/course-detail", courseDetails)
// course-delete
router.get("/dashboard/course-detail/delete-course", deleteCourse)
// edit-course
router.get("/dashboard/course-detail/edit-course", editCourse)
// update-course
router.post("/dashboard/course-detail/update-course", updateCourse)

// ********************************** Chapter Part

// add chapter 
router.get("/dashboard/add-chapter", addChapter)
router.post("/dashboard/add-chapter", upload.single("courseFile"), postChapter, errorMsg)
// for test below link
router.post("/add-chapter", upload.single("courseFile"), postChapter, errorMsg)
// chapter details 
router.get("/dashboard/chapter-detail", chapterDetail)
// Edit Chapters 
router.get("/dashboard/chapter-detail/edit-chapter", editChapter)
// Delete Chapters 
router.get("/dashboard/chapter-detail/delete-chapter", deleteChapter)
// Update Chapter
router.post("/dashboard/chapter-detail/update-chapter", upload.single("courseFile"), updateChapter)

// ******************************* Quiz part **************************
// add quiz 
router.get("/dashboard/add-quiz", addQuiz)
router.post("/dashboard/add-quiz",postQuiz)

// quiz details 
router.get("/dashboard/quiz-detail", quizDetail)

// quiz edit page
router.get("/dashboard/quiz-detail/edit-quiz",editQuiz)
// update post quiz
router.post("/dashboard/quiz-detail/update-quiz",updateQuiz)




// ***************************** Coupons
router.get("/dashboard/add-coupon", getCoupon)
router.post("/dashboard/coupon-generated", postCoupon)

router.get("/dashboard/coupon-detail", detailsCoupon)
// delete
router.get("/dashboard/coupon-detail/delete-coupon", deleteCoupon)
router.get("/dashboard/add-coupon", getCoupon)

router.get("/dashboard/coupon-detail", detailsCoupon)

// ******************************** Orders
router.get("/dashboard/order",order)
router.get("/dashboard/order/course/:id",orderCourse)



// eroor 500 page
router.get('/500', (req, res) => res.render('500'))
router.get("*", async (req, res) => {
    res.render("404", { err: "Page not Found Go back" })
})


// export all routes
module.exports = router