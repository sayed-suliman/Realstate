const express = require('express')
const router = express.Router();

router.get('/dashboard', (req, res) => {
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



module.exports = router;