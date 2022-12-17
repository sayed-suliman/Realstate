const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploaded-media/')
    },
    filename: function (req, file, cb) {
        var fileName = path.parse(file.originalname).name //Filename without extension
        var name = `${fileName}-${Date.now()}${path.extname(file.originalname)}`
        cb(null, name)
    }
})

const upload = multer({
    // dest:"uploaded-media",
    storage: storage,
    limits: {
        fileSize: 10485760
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.endsWith('.pdf')) {
            return cb(new Error("You're uploading other than pdf file. File should be pdf. Try again!"))
        }
        cb(undefined, true)
    }
})
const logoStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/')
    },
    filename: function (req, file, cb) {
        var name = `logo${path.extname(file.originalname)}`
        cb(null, name)
    }
})
const logoUpload = multer({
    storage: logoStorage,
    limits: {
        fileSize: 10485760
    },
    fileFilter(req, file, cb) {
        console.log(file)
        if (file.mimetype === "image/png" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg") {
            return cb(undefined, true)
        }
        return cb(new Error("File should be image. Try again!"))
    }
})

module.exports = { upload, logoUpload } 