const Package = require("../models/package");
const { validationResult } = require("express-validator")
const User = require("../models/users");
const { encodeMsg, decodeMsg } = require("../helper/createMsg");
const Order = require("../models/order");

module.exports = {
    async users(req, res) {
        var { page } = req.query;
        if (!page) page = 1
        var limit = 6 //number of user per page
        var noOfPages = Math.ceil(await User.find({ role: "student" }).count() / limit);
        if (page > noOfPages) {
            const users = await User.find({ role: "student" }).populate('package');
            return res.render("dashboard/examples/users", { title: "Dashboard | Users", users })
        }
        const users = await User.find({ role: "student" }).populate('package').limit(parseInt(limit)).skip(parseInt((page - 1) * limit));
        users.currentPage = page;
        users.pages = noOfPages;
        res.render("dashboard/examples/users/users", { title: "Dashboard | Users", users })
    },
    async addUsers(req, res) {
        try {
            const packages = await Package.find({ status: "publish" })
            var msgToken = req.query.msg;
            var option = {}
            if (msgToken) {
                var msg = decodeMsg(msgToken)
                option = msg
            }
            res.render("dashboard/examples/users/add-users", {
                title: "Dashboard | Add-User",
                packages,
                toast: Object.keys(option).length == 0 ? undefined : option
            })
        } catch (e) {
            res.render("500", {
                title: 'Error 500',
                err: e.message
            })
        }

    },
    // post user
    async postUser(req, res) {
        try {
            const data = req.body
            const formValidations = validationResult(req)
            const packages = await Package.find({ status: "publish" })
            const package = await Package.findOne({ name: data.package }).select("_id") || ""
            if (formValidations.errors.length) {
                const errorObj = {}
                formValidations.errors.forEach(element => {
                    errorObj[element.param] = element.msg
                });
                return res.render("dashboard/examples/users/add-users", {
                    title: "Dashboard | Add-User",
                    err: errorObj,
                    data,
                    packages
                })
            }
            const user = await User({
                name: data.name,
                email: data.email,
                role: data.role,
                package: package || undefined,
                dob: data.dob,
                password: data.password,
                verified: true,
            }).save()
            if(user){
                if(data.role == 'student'){
                    let order = await Order({
                        user:user._id,
                        package: package || undefined,
                        verified:true,
                        pay_method:"offline payment",
                        amount:data.amount,
                    }).save()
                }
                var msg = encodeMsg("User Added")
                res.redirect("/dashboard/add-user?msg=" + msg)
            }
            // const packages = await Package.find({ status: "publish" })
            // res.render("dashboard/examples/users/add-users", {
            //     title: "Dashboard | Add-User",
            //     packages
            // })
        } catch (e) {
            res.render("500", {
                title: 'Error 500',
                err: e.message
            })
            // res.status(404).json({
            //     err: e.message,
            //     status: 404
            // })
        }

    },
    // edit user
    async editUser(req,res){
        try{
            const uId = req.params.id
            const editUser = await User.findById(uId).populate("package")
            console.log(editUser)
            const packages = await Package.find()
            res.render("dashboard/examples/users/user-edit",{
                title:"Dashboard | User-Edit",
                editUser,
                packages
            })
        }catch (e) {
            res.render("500",{
                err:e.message
            })
        }
    },
    // update user
    async updateUser(req,res){
        try{
            res.json({
                data:req.body
            })
        }catch (e) {
            res.status(404).json({
                status:404,
                err:e.message
            })
        }
    }
}
// router.get("/getTask", auth, async (req, res) => {
//     const match = {}
//     const sort = {}
//     if (req.query.completed) {
//         match.status = req.query.completed === "true"
//     }
//     if (req.query.sort) {
//         const parts = req.query.sort.split(":")
//         sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
//     }
//     try {
//         // const task = await Task.find({owner:req.user._id})
//         await req.user.populate({
//             path: "tasks",
//             match,
//             options: {
//                 limit: parseInt(req.query.limit),
//                 skip: parseInt(req.query.skip),
//                 sort
//             }
//         })
//         res.status(200).send(req.user.tasks)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })