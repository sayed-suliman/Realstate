const express = require("express");
const router = new express.Router();
const salespersonRoutes = require("./salesperson/index");
const { login, postLogin, signUp } = require("../controllers/auth");
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
  isRegulatorOrStudent,
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
const { checkout, doCheckout } = require("../controllers/checkout");
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
  sendVerificationCode,
  welcomeEmail,
  sendAgreement,
} = require("../controllers/mailServices");
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
const User = require("../models/users");
const url = require("url");
const { encodeMsg } = require("../helper/createMsg");
const reCAPTCHA = require("../middleware/reCAPTCHA");
const trial = require("../controllers/trial");
const buyMore = require("../controllers/buy-more");
const freeLesson = require("../controllers/freeCourseRegistration");
const freeLessonValidation = require("../middleware/freeLessonValidation");

router.get("/test", (req, res) => {
  sendVerificationCode("sulimank418@gmail.com", "1234");
  res.render("package");
});
router.get("/email", (req, res) => {
  const testUser = {
    username: "Suliman Khan",
    orderDate: "24 Dec 2022",
    packageName: "Basic",
    packageCourses: ["Course 1", "Course 2", "Course 3"],
    totalPrice: "200",
    siteName: process.env.SITE_NAME,
    siteURL: "https://members.realestateinstruct.com",
  };
  // welcomeEmail("sulimank418@gmail.com", testUser);
  sendAgreement("sulimank418@gmail.com", "Suliman Khan");
  res.render("mail/otp", {
    username: "Suliman Khan",
    orderDate: "24 Dec 2022",
    packageName: "Basic",
    packageCourses: ["Course 1", "Course 2", "Course 3"],
    totalPrice: "200",
    site_name: "Real estate Instruct",
    url: "#",
    code: 123,
    agree: true,
  });
});
// default route
router.get("/", async (req, res) => {
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
    res.redirect("/");
  }
});

// login route
router.get("/login", logged_in, login);
router.get("/loginAsStudent", isAdmin, async (req, res) => {
  if (req.query.uid) {
    let adminId = req.user._id.toString();
    if (adminId == req.query.uid) {
      return res.redirect(
        url.format({
          pathname: "/dashboard",
          query: {
            msg: encodeMsg("You can't login as yourself", "danger"),
          },
        })
      );
    }
    const user = await User.findById(req.query.uid).populate([
      {
        path: "package",
        populate: { path: "courses", match: { status: "publish" } },
      },
      { path: "courses" },
    ]);
    if (user.packages.length || user.courses.length) {
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        req.session.admin = adminId;
        return res.redirect(
          url.format({
            pathname: "/dashboard",
            query: {
              msg: encodeMsg("You're login as a " + user.name),
            },
          })
        );
      });
    } else {
      res.redirect(
        "/dashboard/users?msg=" +
          encodeMsg("Please add courses to continue.", "danger")
      );
    }
  } else {
    res.redirect(
      "/dashboard/users?msg=" + encodeMsg("User ID is required.", "danger")
    );
  }
});
// router.post('/login',postLogin)
router.post("/login", /*reCAPTCHA,*/ verifiedAndPaid, authLocal, postLogin);
// Logout
router.get("/logout", async (req, res) => {
  // if admin login as student
  if (req.session.admin) {
    const user = await User.findById(req.session.admin);
    let msg = encodeMsg("Login back as admin");
    if (req.session.adminMsg) {
      msg = encodeMsg(req.session.adminMsg, "danger");
    }
    return req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect(
        url.format({
          pathname: "/dashboard",
          query: {
            msg,
          },
        })
      );
    });
    // delete req.session.admin;
  }
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// forgot password
router.get("/reset-password", forgotPassword);
router.get("/forgot-password", (req, res) => res.redirect("/reset-password"));
router.post("/forgot-password", doForgotPassword);
// Used in email
router.get("/user/reset-password", resetPassword);
router.post("/reset-password", doResetPassword);

// checkout post
router.get("/checkout", checkout);
router.get("/register", (req, res) => res.redirect("/"));
router.post("/register", /* reCAPTCHA,*/ signUpMiddleware, signUp);

// middleware for all dashboard route
router.use("/dashboard", authenticated);
router.use("/dashboard/salesperson", salespersonRoutes);

// main-dashboard
router.get("/dashboard", dashboard);

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

// ************************************ contact-us
router.get("/dashboard/contact-us", isStudent, contactUs);
router.post("/dashboard/contact-us", isStudent, postContact);

//  ************************************ Setting

router.get("/dashboard/setting", settingView);
router.post(
  "/dashboard/setting",
  logoUpload.single("logo"),
  doSetting,
  settingError
);
// setting post for student
router.post(
  "/dashboard/userSetting",
  userAvatar.single("avatar"),
  doSetting,
  settingError
);

// ********************************************* users
router.get("/dashboard/users", isAdmin, users);
router.get("/dashboard/add-user", isAdmin, addUsers);
// post user by admin
router.post("/dashboard/add-user", isAdmin, addUserByAdminMiddleware, postUser);
//edit page to admin
router.get("/dashboard/user-edit/:id", isAdmin, editUser);
// update user
router.post("/dashboard/user-edit/update-user", isAdmin, updateUser);

// ****************************** Packages
//add package
router.get("/dashboard/add-package", isAdmin, package);
router.post("/dashboard/add-package", isAdmin, addPackage);
// package details
router.get("/dashboard/package-detail", isAdmin, packagesDetail);
router.get("/dashboard/package-detail/edit-package", isAdmin, editPackage);
router.post("/dashboard/package-detail/update-package", isAdmin, updatePackage);
// delete package
router.get("/dashboard/package-detail/delete-package", isAdmin, deletePackage);

//  ******************************* Courses
// for student view only
router.get("/dashboard/courses", allCourses);
// add course
// render of course add
router.get("/dashboard/add-course", isAdmin, course);
// course-add post
router.post(
  "/dashboard/add-course",
  courseBanner.single("banner"),
  isAdmin,
  addcourse,
  courseError
);

// course-detail
router.get("/dashboard/course-detail", courseDetails);
// course-delete
router.get("/dashboard/course-detail/delete-course", isAdmin, deleteCourse);
// edit-course
router.get("/dashboard/course-detail/edit-course", isAdmin, editCourse);
// update-course
router.post(
  "/dashboard/course-detail/update-course",
  courseBanner.single("banner"),
  isAdmin,
  updateCourse
);
// for student || regulator
router.get("/dashboard/view-course/", (req, res) => res.redirect("/dashboard"));
router.get("/dashboard/view-course/:id", viewCourse);

// ********************************** Chapter Part

// add chapter
router.get("/dashboard/add-chapter", isAdmin, addChapter);
router.post(
  "/dashboard/add-chapter",
  upload.single("courseFile"),
  isAdmin,
  postChapter,
  errorMsg
);
// for test below link
router.post("/add-chapter", upload.single("courseFile"), postChapter, errorMsg);
// chapter details
router.get("/dashboard/chapter-detail", isAdmin, chapterDetail);
// Edit Chapters
router.get("/dashboard/chapter-detail/edit-chapter", isAdmin, editChapter);
// Delete Chapters
router.get("/dashboard/chapter-detail/delete-chapter", isAdmin, deleteChapter);
// Update Chapter
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

// ******************************* Quiz part **************************
// add quiz
router.get("/dashboard/add-quiz", isAdmin, addQuiz);
router.post("/dashboard/add-quiz", isAdmin, postQuiz);

// quiz details
router.get("/dashboard/quiz-detail", isAdmin, quizDetail);

// quiz edit page
router.get("/dashboard/quiz-detail/edit-quiz", isAdmin, editQuiz);
// update post quiz
router.post("/dashboard/quiz-detail/update-quiz", isAdmin, updateQuiz);

// Student(view)
router.get("/dashboard/view-quiz/:courseId/:id", viewQuiz);
router.post("/test-quiz", takeQuiz);

// ***************************** Coupons
router.get("/dashboard/add-coupon", isAdmin, getCoupon);
router.post("/dashboard/coupon-generated", isAdmin, postCoupon);

router.get("/dashboard/coupon-detail", isAdmin, detailsCoupon);
// delete
router.get("/dashboard/coupon-detail/delete-coupon", isAdmin, deleteCoupon);

// ******************************** Sort
router.get("/dashboard/sort", isAdmin, sort);
router.get("/dashboard/sort/course/:id", isAdmin, sortCourse);
// sort data using jquery..!
router.post("/sort/data", sortData);

// ************************************ Orders
router.get("/dashboard/order", allOrders);

// ************************************ buy-more
router.get("/dashboard/buy-more", buyMore);

// ************************************ message
router.get("/dashboard/messages", isAdmin, messages);
router.get("/dashboard/read-message/:id", isAdmin, readMessage);

router.get("/trial/chapter/:courseID/:chapterID", trial.chapter);
router.get("/trial/quiz/:courseID/:quizID", trial.quiz);

// Free Lesson Registration
router.get("/free-lesson", freeLesson.register);
router.post(
  "/free-lesson",
  /*reCAPTCHA,*/ freeLessonValidation,
  freeLesson.doRegister
);
// error 500 page
router.get("/500", (req, res) => res.render("500"));
router.get("*", async (req, res) => {
  res.render("404", { title: "404 Error", err: "Page not Found Go back" });
});

// export all routes
module.exports = router;
