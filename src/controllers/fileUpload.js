const multer = require("multer")
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/uploaded-media/')
    },
    filename:function(req,file,cb){
        cb(null,file.originalname+'.pdf')
    }
})

const upload = multer({
    // dest:"uploaded-media",
    storage:storage,
    limits:{
        fileSize:9000000
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