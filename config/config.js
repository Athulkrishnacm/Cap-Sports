require("dotenv").config()
const sessionSecret = process.env.SESSION_SECRET_KEY;

const emailUser = "athulcm771@gmail.com"
const emailPassword = "vlaiimlbtavwqbjy"

const { name } = require("ejs");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
   destination:function(req, file,cb){
      cb(null, path.join(__dirname, "../public/Images"))
   },
   filename:function(req, file,cb){
      const name = Date.now()+'-'+file.originalname;
      cb(null, name)
   }
})

const upload = multer({
   storage:storage,
   fileFilter:function(req,file,cb){
      const filetypes = /jpeg|jpg|png/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
      if(mimetype&&extname){
 return cb(null, true)
      }
      cb('Error:JPEG or PNG Images only')
   }
})

module.exports = {
   sessionSecret,
   emailUser,
   emailPassword
  
}