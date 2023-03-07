const express = require("express");
const router = new express.Router();
const salespersonRoutes = require("./salesperson/index");
const {
  login,
  postLogin,
  signUp,
  loginAsStudent,
  logout,
} = require("../controllers/auth");
const {
  forgotPassword,
  doForgotPassword,
  doResetPassword,
  resetPassword,
} = require("../controllers/reset-password");
const authLocal = require("../middleware/auth-strategy");
const {
  authenticated,
  logged_in,
  isStudent,
  isAdmin,
  verifiedAndPaid,
} = require("../middleware/authentication");
const signUpMiddleware = require("../middleware/authValidation");
const {
  course,
  addcourse,
  courseDetails,
  deleteCourse,
  editCourse,
  updateCourse,
  viewCourse,
  allCourses,
  courseError,
} = require("../controllers/courses");
const {
  package,
  addPackage,
  packagesDetail,
  editPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/package");
const { checkout } = require("../controllers/checkout");
const { verification, doVerification } = require("../controllers/verification");
const { resendCode } = require("../controllers/resendVerificationCode");
const { payment } = require("../controllers/payment");
const {
  upload,
  logoUpload,
  userAvatar,
  courseBanner,
} = require("./../controllers/fileUpload");
const {
  addChapter,
  chapterDetail,
  postChapter,
  errorMsg,
  deleteChapter,
  editChapter,
  updateChapter,
  viewChapter,
  markAsCompleted,
} = require("../controllers/chapters");
const {
  paypalAPI,
  paymentSuccess,
  stripeIntent,
  stripeIntentCancel,
} = require("../controllers/paymentGateWay");
const {
  addQuiz,
  quizDetail,
  postQuiz,
  editQuiz,
  updateQuiz,
  viewQuiz,
  takeQuiz,
} = require("./../controllers/quiz");
const {
  getCoupon,
  detailsCoupon,
  postCoupon,
  deleteCoupon,
  couponAPI,
  couponRegisterAPI,
} = require("../controllers/coupons");
const { dashboard } = require("../controllers/dashboard");
const {
  users,
  addUsers,
  postUser,
  editUser,
  updateUser,
} = require("../controllers/users");
const { sort, sortCourse, sortData } = require("../controllers/sort");
const Package = require("../models/package");
const addUserByAdminMiddleware = require("../middleware/authaddAdminUser");
const { allOrders } = require("../controllers/orderOrRegisteredStds");
const {
  contactUs,
  postContact,
  messages,
  readMessage,
} = require("../controllers/contact");
const {
  settingView,
  doSetting,
  settingError,
} = require("../controllers/setting");
const trial = require("../controllers/trial");
const buyMore = require("../controllers/buy-more");
const freeLesson = require("../controllers/freeCourseRegistration");
const freeLessonValidation = require("../middleware/freeLessonValidation");
const { theme, doTheme } = require("../controllers/theme");
const { checkFontURL } = require("../middleware/checkFont");

// default route
router.get("/packages", async (req, res) => {
  try {
    const msg = req.query.msg;
    const type = req.query.type;
    const packages = await Package.find({ status: "publish" })
      .populate({
        path: "courses",
        match: {
          status: "publish",
        },
      })
      .sort("price");
    const packageObj = {};
    packages.forEach((package) => {
      packageObj[package.name] = package;
    });
    res.render("package", {
      packages,
      msg: { text: msg, type },
      title: "Packages Plan",
      packageObj,
    });
  } catch (error) {
    res.redirect("/packages");
  }
});

// auth route
router.get("/", logged_in, login);
router.get("/loginAsStudent", isAdmin, loginAsStudent);
<<<<<<< HEAD
router.post("/login", verifiedAndPaid, authLocal, postLogin);
=======
router.get("/login", (req, res) => res.redirect("/"));
router.post("/login", reCAPTCHA, verifiedAndPaid, authLocal, postLogin);
>>>>>>> dev
router.get("/logout", logout);

// forgot password
router.get("/reset-password", forgotPassword);
router.get("/forgot-password", (req, res) => res.redirect("/reset-password"));
router.post("/forgot-password", doForgotPassword);
router.get("/user/reset-password", resetPassword);
router.post("/reset-password", doResetPassword);

//checkout
router.get("/checkout", checkout);
<<<<<<< HEAD
router.get("/register", (req, res) => res.redirect("/"));
router.post("/register", signUpMiddleware, signUp);
=======
router.get("/register", (req, res) => res.redirect("/login"));
router.post("/register", reCAPTCHA, signUpMiddleware, signUp);
>>>>>>> dev

// verification route
router.get("/verification", verification);
router.post("/verifying", doVerification);
router.get("/resend", resendCode);

// payment routes
router.get("/payment", payment);
router.post("/create-payment-intent", stripeIntent);
router.post("/cancel-payment-intent", stripeIntentCancel);
router.post("/paypal", paypalAPI);
router.get("/success", paymentSuccess);
router.post("/check-coupon", couponAPI);
router.post("/register-coupon", couponRegisterAPI);

// middleware for all dashboard route
router.use("/dashboard", authenticated);
// router.use("/dashboard/salesperson", salespersonRoutes);

// main-dashboard
router.get("/dashboard", dashboard);

// contact-us
router.get("/dashboard/contact-us", isStudent, contactUs);
router.post("/dashboard/contact-us", isStudent, postContact);

//  Setting
router.get("/dashboard/setting", settingView);
router.post(
  "/dashboard/setting",
  logoUpload.single("logo"),
  doSetting,
  settingError
);

// theme customization
router.get("/dashboard/theme", theme);
router.post("/dashboard/theme", checkFontURL, doTheme);

// for student
router.post(
  "/dashboard/userSetting",
  userAvatar.single("avatar"),
  doSetting,
  settingError
);

// users
router.get("/dashboard/users", isAdmin, users);
router.get("/dashboard/add-user", isAdmin, addUsers);
router.post("/dashboard/add-user", isAdmin, addUserByAdminMiddleware, postUser);
router.get("/dashboard/user-edit/:id", isAdmin, editUser);
router.post("/dashboard/user-edit/update-user", isAdmin, updateUser);

//package
router.get("/dashboard/add-package", isAdmin, package);
router.post("/dashboard/add-package", isAdmin, addPackage);
router.get("/dashboard/package-detail", isAdmin, packagesDetail);
router.get("/dashboard/package-detail/edit-package", isAdmin, editPackage);
router.post("/dashboard/package-detail/update-package", isAdmin, updatePackage);
router.get("/dashboard/package-detail/delete-package", isAdmin, deletePackage);

// Courses
router.get("/dashboard/add-course", isAdmin, course);
router.post(
  "/dashboard/add-course",
  courseBanner.single("banner"),
  isAdmin,
  addcourse,
  courseError
);
router.get("/dashboard/course-detail", courseDetails);
router.get("/dashboard/course-detail/delete-course", isAdmin, deleteCourse);
router.get("/dashboard/course-detail/edit-course", isAdmin, editCourse);
router.post(
  "/dashboard/course-detail/update-course",
  courseBanner.single("banner"),
  isAdmin,
  updateCourse
);
// for student || regulator
router.get("/dashboard/courses", allCourses);
router.get("/dashboard/view-course/", (req, res) => res.redirect("/dashboard"));
router.get("/dashboard/view-course/:id", viewCourse);

//Chapter
router.get("/dashboard/add-chapter", isAdmin, addChapter);
router.post(
  "/dashboard/add-chapter",
  upload.single("courseFile"),
  isAdmin,
  postChapter,
  errorMsg
);
router.get("/dashboard/chapter-detail", isAdmin, chapterDetail);
router.get("/dashboard/chapter-detail/edit-chapter", isAdmin, editChapter);
router.get("/dashboard/chapter-detail/delete-chapter", isAdmin, deleteChapter);
router.post(
  "/dashboard/chapter-detail/update-chapter",
  upload.single("courseFile"),
  isAdmin,
  updateChapter
);
//for student
router.get("/dashboard/view-chapter", (req, res) => {
  res.redirect("/dashboard");
});
router.get("/dashboard/view-chapter/:courseId/:id", viewChapter);
router.post("/mark-completed", markAsCompleted);

//Quiz
router.get("/dashboard/add-quiz", isAdmin, addQuiz);
router.post("/dashboard/add-quiz", isAdmin, postQuiz);
router.get("/dashboard/quiz-detail", isAdmin, quizDetail);
router.get("/dashboard/quiz-detail/edit-quiz", isAdmin, editQuiz);
router.post("/dashboard/quiz-detail/update-quiz", isAdmin, updateQuiz);
// for Student
router.get("/dashboard/view-quiz/:courseId/:id", viewQuiz);
router.post("/test-quiz", takeQuiz);

// Coupons
router.get("/dashboard/add-coupon", isAdmin, getCoupon);
router.post("/dashboard/coupon-generated", isAdmin, postCoupon);
router.get("/dashboard/coupon-detail", isAdmin, detailsCoupon);
router.get("/dashboard/coupon-detail/delete-coupon", isAdmin, deleteCoupon);

//  Sort
router.get("/dashboard/sort", isAdmin, sort);
router.get("/dashboard/sort/course/:id", isAdmin, sortCourse);
router.post("/sort/data", sortData);

//  Orders
router.get("/dashboard/order", allOrders);

// buy-more
router.get("/dashboard/buy-more", buyMore);

// message
router.get("/dashboard/messages", isAdmin, messages);
router.get("/dashboard/read-message/:id", isAdmin, readMessage);

router.get("/trial/chapter/:courseID/:chapterID", trial.chapter);
router.get("/trial/quiz/:courseID/:quizID", trial.quiz);

// Free Lesson Registration
router.get("/free-lesson", freeLesson.register);
router.post("/free-lesson", freeLessonValidation, freeLesson.doRegister);
// error 500 page
router.get("/500", (req, res) => res.render("500"));
router.get("*", async (req, res) => {
  res.render("404", { title: "Page Not Found" });
});

// export all routes
module.exports = router;
