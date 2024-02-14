const multer = require("multer");
const path = require("path");
const { diskStorage } = require('multer');

const storage = multer.diskStorage({
  destination:(req, file, cb)=>{
    cb(null, path.join(__dirname,"../public/uploads/product-images"))
  },
  filename:(req, file, cb)=>{
    cb(null, new Date().toISOString().replace(/[-T:.Z]/g, '') + "_" + file.originalname)
  }
})
const uploads = multer({storage:storage});
module.exports = uploads;
