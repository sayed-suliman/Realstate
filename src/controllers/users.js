const User = require("../models/users")

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
        res.render("dashboard/examples/users", { title: "Dashboard | Users", users })
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