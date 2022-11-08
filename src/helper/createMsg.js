const jwt = require('jsonwebtoken')

module.exports = {
    encodeMsg(text, type='success', status = 201) {
        var msg = jwt.sign({ msg: { text, type, status } }, process.env.SECRET)
        return msg
    },
    decodeMsg(token) {
        var decode = jwt.verify(token, process.env.SECRET)
        return decode.msg
    }
}