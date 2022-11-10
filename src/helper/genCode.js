
module.exports = {
    generateCode() {
        var number = '1234567890'
        let code = ''
        for (let i = 0; i < 4; i++) {
            code += number[Math.floor(Math.random() * number.length)]
        }
        return code;
    }
};