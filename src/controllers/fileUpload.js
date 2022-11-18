const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/uploaded-media/')
    },
    filename:function(req,file,cb){
        console.log(file)
        var fileName = path.parse(file.originalname).name //Filename without extension
        var name = `${fileName}-${Date.now()}${path.extname(file.originalname)}`
        console.log(name)
        cb(null,name)
    }
})

const upload = multer({
    // dest:"uploaded-media",
    storage:storage,
    limits:{
        fileSize:10000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.endsWith('.pdf')){
            return cb(new Error("You're uploading other than pdf file. File should be pdf. Try again!"))
        }
        cb(undefined,true)
    }
})

module.exports = {upload} 
// from stackoverflow
// var multer = require('multer');
// var path = require('path')

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
//   }
// })

// var upload = multer({ storage: storage });