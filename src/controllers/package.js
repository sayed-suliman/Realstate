const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Package = require("../models/package")
const Course = require("../models/courses");
const { diffIndexes } = require("../models/courses");
module.exports = {
    async package(req, res) {
        try {
            const courses = await Course.find({ status: 'publish' })
            if (req.params.id) {
                return res.render("dashboard/examples/packages/add-package", {
                    title: req.params.id + "| Edit Package",
                    courses

                })
            }
            return res.render("dashboard/examples/packages/add-package", {
                title: "Dashboard | Add Package",
                courses
            })
        } catch (e) {
            res.staus(404).json({
                status: 404,
                error: e.message
            })
        }
    },
    async addPackage(req, res) {
        try {
            // const 
            const course = await Course.find({ name: req.body.coursename }).select("_id")
            const packageData = await req.body
            let selectCourses = req.body.coursename
            const package = await Package({
                name: packageData.name,
                status: packageData.status,
                tax: packageData.tax,
                courses: course,
                whoFor: packageData.whoFor,
                whatsIncluded: packageData.whatsIncluded,
                price: packageData.price,
            }).save();
            if (package) {
                // link added to package
                package.link = "/checkout?package=" + package._id
                await package.save()
                if (selectCourses) {
                    if (Array.isArray(selectCourses)) {
                        selectCourses.forEach(async (cs) => {
                            let course = await Course.findOne({ name: cs })
                            course.package = course.package.concat(package._id)
                            await course.save()
                        })
                    } else {
                        const oneCourse = await Course.findOne({ name: selectCourses })
                        oneCourse.package = oneCourse.package.concat(package._id)
                        await oneCourse.save()
                    }
                }
                var msg = encodeMsg('The package has been created')
                return res.redirect('/dashboard?msg=' + msg)
            }
            // testing
            // res.json({
            //     msg:"success",
            //     data: req.body,
            // })
        } catch (error) {
            // for testing
            res.status(404).json({
                err: error.message,
                status: 404
            })


            // for production mode
            // var msg = encodeMsg('Some error while creating package.', 'danger', '500')
            // return res.redirect('/dashboard?msg=' + msg)
        }
    },
    async packagesDetail(req, res) {
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        const packages = await Package.find().populate({
            path: 'courses', match: {
                status: 'publish'
            }
        });
        res.render("dashboard/examples/packages/package-detail", {
            title: "Dashboard | Package Detail",
            packages,
            toast: Object.keys(option).length == 0 ? undefined : option
        })
    },
    async editPackage(req, res) {

        try {
            let packageId = req.query.pId
            const courses = await Course.find({status:'publish'});
            const package = await Package.findById(packageId).populate({
                path: 'courses', match: {
                    status: "publish"
                }
            });
            if (package) {
                // const packages = await Package.find({ status: "publish" })
                return res.render("dashboard/examples/packages/package-edit",
                    { title: "Dashboard | Edit Package", package, courses }
                )
            }
            res.redirect('/dashboard/package-detail')
        } catch (e) {
            if (e.message.includes('Cast to ObjectId')) {
                return res.redirect('/dashboard/package-detail')
            }
            res.render("500")
        }
    },
    async updatePackage(req, res) {
        try {
            const data = req.body
            const pId = req.query.pId
            const package = await Package.findById(pId)
            const course = await Course.find({ name: req.body.coursename }).select("_id")
            // get all courses to update their packages
            let courses = await Course.find()
            await package.updateOne({
                ...data,
                courses: course
            })
            if (package) {
                if (!(data.coursename)) {
                    console.log('nocourses-selected')
                    const courses = await Course.find()
                    courses.forEach(async (cs) => {
                        const index = cs.package.indexOf(pId)
                        cs.package.splice(index, 1)
                        await cs.save()
                    })
                }
                if (data.coursename) {
                    if (Array.isArray(data.coursename)) {
                        courses.forEach(async (cs) => {
                            const index = cs.package.indexOf(pId)
                            let isCourseContain = data.coursename.includes(cs.name)
                            if (isCourseContain) {
                                if (!(index > -1)) {
                                    cs.package = cs.package.concat(pId)
                                }
                            } else {
                                if (index > -1) {
                                    cs.package.splice(index, 1)
                                }
                            }
                            await cs.save()
                            console.log('saved', cs)
                        })
                    } else {
                        console.log('another here')
                        courses.forEach(async (cs) => {
                            const index = cs.package.indexOf(pId)
                            if (cs.name == data.coursename) {
                                if (!(index > -1)) {
                                    cs.package = cs.package.concat(pId)
                                    await cs.save()
                                }
                            } else {
                                if (index > -1) {
                                    cs.package.splice(index, 1)
                                    await cs.save()
                                }
                            }
                        })
                    }
                }
            }
            var msg = encodeMsg("Package Updated")
            return res.redirect("/dashboard/package-detail?msg=" + msg)
        } catch (e) {
            res.render("404")
        }
    },
    async deletePackage(req, res) {
        try {
            let packageId = req.query.pId
            const package = await Package.findById(packageId)
            await package.remove()
            var msg = encodeMsg("Package and their related courses are deleted", "danger")
            return res.redirect("/dashboard/package-detail?msg=" + msg)

        } catch (e) {
            res.render("500")
            // res.status(404).json({
            //     msg:e.message,
            //     status:404
            // })
        }
    }
}