const express = require("express")
const router = new express.Router()
const { login, postLogin, signUp } = require("../controllers/auth")
const { forgotPassword, doForgotPassword, doResetPassword, resetPassword } = require("../controllers/reset-password")
const authLocal = require("../middleware/auth-strategy")
const { authenticated, logged_in, isStudent, isAdmin, verifiedAndPaid, isAdminorRegulator } = require("../middleware/authentication")
const signUpMiddleware = require("../middleware/authValidation")
const { course, addcourse, courseDetails, deleteCourse, editCourse, updateCourse, viewCourse, allCourses } = require("../controllers/courses")
const { package, addPackage, packagesDetail, editPackage, updatePackage, deletePackage } = require("../controllers/package")
const { checkout, doCheckout } = require("../controllers/checkout")
const { verification, doVerification } = require("../controllers/verification")
const { resendCode } = require("../controllers/resendVerificationCode")
const { payment } = require("../controllers/payment")
const { upload } = require("./../controllers/fileUpload")
const { addChapter, chapterDetail, postChapter, errorMsg, deleteChapter, editChapter, updateChapter, viewChapter, markAsCompleted } = require("../controllers/chapters")
const { paypalAPI, paymentSuccess, stripeIntent, stripeIntentCancel } = require("../controllers/paymentGateWay")
const { addQuiz, quizDetail, postQuiz, editQuiz, updateQuiz, viewQuiz, takeQuiz } = require("./../controllers/quiz")
const { sendVerificationCode } = require("../controllers/mailServices")
const { getCoupon, detailsCoupon, postCoupon, deleteCoupon, couponAPI, couponRegisterAPI } = require("../controllers/coupons")
const { dashboard } = require("../controllers/dashboard")
const { users, addUsers, postUser } = require("../controllers/users")
const { sort, sortCourse, sortData } = require("../controllers/sort")
const Package = require("../models/package")
const addUserByAdminMiddleware = require("../middleware/authaddAdminUser")
const { allOrders } = require("../controllers/orderOrRegisteredStds")
const { contactUs, postContact, messages } = require("../controllers/contact")


router.get("/test", (req, res) => {
    sendVerificationCode('sulimank418@gmail.com', '1234')
    res.render("package")
})
// default route
router.get("/", async (req, res) => {
    const msg = req.query.msg;
    const type = req.query.type;
    const packages = await Package.find({ status: "publish" }).populate("courses");
    const packageObj = {}
    packages.forEach(package => {
        packageObj[package.name] = package
    })
    res.render("package", { packages, msg: { text: msg, type }, title: "Packages Plan", packageObj })
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
router.post('/register-coupon', couponRegisterAPI)




// ************************************ contact-us
router.get("/dashboard/contact-us", isStudent, contactUs)
router.post("/dashboard/contact-us", isStudent, postContact)



// ********************************************* users
router.get("/dashboard/users", isAdminorRegulator, users)
router.get("/dashboard/add-user", isAdmin, addUsers)
// post user by admin
router.post("/dashboard/add-user", isAdmin, addUserByAdminMiddleware, postUser)



// ****************************** Packages
//add package
router.get("/dashboard/add-package", isAdmin, package)
router.post('/dashboard/add-package', isAdmin, addPackage)
// package details
router.get("/dashboard/package-detail", isAdminorRegulator, packagesDetail)
router.get("/dashboard/package-detail/edit-package", isAdmin, editPackage)
router.post("/dashboard/package-detail/update-package", isAdmin, updatePackage)
// delete package
router.get("/dashboard/package-detail/delete-package", isAdmin, deletePackage)



//  ******************************* Courses
// for student view only
router.get("/dashboard/courses", allCourses)
// add course
// render of course add
router.get("/dashboard/add-course", isAdmin, course)
// course-add post
router.post("/dashboard/add-course", isAdmin, addcourse)

// course-detail
router.get("/dashboard/course-detail", courseDetails)
// course-delete
router.get("/dashboard/course-detail/delete-course", isAdmin, deleteCourse)
// edit-course
router.get("/dashboard/course-detail/edit-course", isAdmin, editCourse)
// update-course
router.post("/dashboard/course-detail/update-course", isAdmin, updateCourse)
// for student
router.get('/dashboard/view-course/', (req, res) => res.redirect('/dashboard'))
router.get('/dashboard/view-course/:id', viewCourse)

// ********************************** Chapter Part

// add chapter 
router.get("/dashboard/add-chapter", isAdmin, addChapter)
router.post("/dashboard/add-chapter", upload.single("courseFile"), isAdmin, postChapter, errorMsg)
// for test below link
router.post("/add-chapter", upload.single("courseFile"), postChapter, errorMsg)
// chapter details 
router.get("/dashboard/chapter-detail", isAdminorRegulator, chapterDetail)
// Edit Chapters 
router.get("/dashboard/chapter-detail/edit-chapter", isAdmin, editChapter)
// Delete Chapters 
router.get("/dashboard/chapter-detail/delete-chapter", isAdmin, deleteChapter)
// Update Chapter
router.post("/dashboard/chapter-detail/update-chapter", upload.single("courseFile"), isAdmin, updateChapter)
//for student 
router.get('/dashboard/view-chapter', (req, res) => { res.redirect('/dashboard') })
router.get('/dashboard/view-chapter/:id', viewChapter)
router.post('/mark-completed', markAsCompleted)

// ******************************* Quiz part **************************
// add quiz 
router.get("/dashboard/add-quiz", isAdmin, addQuiz)
router.post("/dashboard/add-quiz", isAdmin, postQuiz)

// quiz details 
router.get("/dashboard/quiz-detail", isAdminorRegulator, quizDetail)

// quiz edit page
router.get("/dashboard/quiz-detail/edit-quiz", isAdmin, editQuiz)
// update post quiz
router.post("/dashboard/quiz-detail/update-quiz", isAdmin, updateQuiz)

// Student(view)
router.get('/dashboard/view-quiz/:id', viewQuiz)
router.post('/test-quiz', takeQuiz)




// ***************************** Coupons
router.get("/dashboard/add-coupon", isAdmin, getCoupon)
router.post("/dashboard/coupon-generated", isAdmin, postCoupon)

router.get("/dashboard/coupon-detail", isAdminorRegulator, detailsCoupon)
// delete
router.get("/dashboard/coupon-detail/delete-coupon", isAdmin, deleteCoupon)


// ******************************** Sort
router.get("/dashboard/sort", isAdminorRegulator, sort)
router.get("/dashboard/sort/course/:id", isAdminorRegulator, sortCourse)
// sort data using jquery..!
router.post('/sort/data', sortData)

// ************************************ Orders
router.get("/dashboard/order", allOrders)

// ************************************ message
router.get("/dashboard/messages", isAdmin, messages)
router.get("/dashboard/read-message/:id", isAdmin, async (req, res) => {
    try {
        if (req.params.id) {
            const Message = require('../models/message')
            const msg = await Message.findById(req.params.id)
            await msg.updateOne({ read: true })
            return res.render('dashboard/examples/read-msg', {
                title: "Dashboard | Message",
                msg
            })
        }
        return res.redirect('/dashboard')
    } catch (error) {
        const { encodeMsg } = require('../helper/createMsg')
        res.redirect('/dashboard?msg=' + encodeMsg(error.message, 'danger'))
    }
})



// eroor 500 page
router.get('/500', (req, res) => res.render('500'))
router.get("*", async (req, res) => {
    res.render("404", { title: "404 Error", err: "Page not Found Go back" })
})


// export all routes
module.exports = router