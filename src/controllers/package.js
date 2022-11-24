const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Package = require("../models/package")
const Course = require("../models/courses")
module.exports = {
    async package(req, res) {
        try {
            const courses = await Course.find()
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
            // const coursesName = []
            // course.forEach(course => {
            //     coursesName.push(course.name)
            // })
            const package = await Package({
                name: packageData.name,
                status: packageData.status,
                tax: packageData.tax,
                courses: course,
                price: packageData.price
            }).save();
            if (package) {
                var msg = encodeMsg('The package has been created')
                return res.redirect('/dashboard?msg=' + msg)
            }
            // testing
            // res.json({
            //     data: req.body.coursename,
            //     courses:course,
            //     package
            // })
        } catch (error) {
            // for testing
            // res.status(404).json({
            //     err: error.message,
            //     status: 404
            // })


            // for production mode
            var msg = encodeMsg('Some error while creating package.', 'danger', '500')
            return res.redirect('/dashboard?msg=' + msg)
        }
    },
    async packagesDetail(req, res) {
        var msgToken = req.query.msg;
        var option = {}
        if (msgToken) {
            var msg = decodeMsg(msgToken)
            option = msg
        }
        const packages = await Package.find().populate('courses');
        res.render("dashboard/examples/packages/package-detail", {
            title: "Dashboard | Package Detail",
            packages,
            toast: Object.keys(option).length == 0 ? undefined : option
        })
    },
    async editPackage(req, res) {

        try {
            let packageId = req.query.pId
            const courses = await Course.find();
            const package = await Package.findById(packageId).populate('courses');
            // const packages = await Package.find({ status: "publish" })
            res.render("dashboard/examples/packages/package-edit",
                { title: "Dashboard | Edit Package", package,courses }
            )
        } catch (e) {
            res.status(404).json({
                error: e.message,
                status: 404
            })
            // res.render("500")
        }
    },
    async updatePackage(req, res) {
        try {
            const data = req.body
            console.log(req.body)
            const package = await Package.findById(req.query.pId)
            const course = await Course.find({ name: req.body.coursename }).select("_id")
            // const packageId = await Package.findOne({ name: data.package })
            await package.updateOne({
                ...data,
                courses:course
            })
            // res.json({
            //     data:package
            // })
            // await course.updateOne({
            //     name: data.name,
            //     description: data.description,
            //     status: data.status,
            //     package: packageId._id,
            //     price: data.price
            // })
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