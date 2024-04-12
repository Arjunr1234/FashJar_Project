const express = require("express");
const path = require("path");
const nocache = require("nocache");
const session = require("express-session");
const flash = require("express-flash");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser")


const userAuthRoute = require("./routes/userAuth");
const adminAuthRoute = require("./routes/adminAuth")

const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Fashjar");

mongoose.connection.on("connected", () => console.log("Connected to MongoDB"));
mongoose.connection.on("error", (err) => console.log("Error in connecting to MongoDB:", err));
mongoose.connection.on("disconnected", () => console.log("Disconnected from MongoDB"));
app.use("/public",express.static(path.join(__dirname,'/public')))

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views",[path.join(__dirname,"views/user"),path.join(__dirname,'views/admin')]);

app.use(
  session({
    secret:"2232kdfdkf9788",
    resave:false,
    saveUninitialized:true
  })
)
app.use(bodyParser.json());
app.use("/", nocache());
app.use(flash())
app.use((req,res,next)=>{
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
})

app.use("/", userAuthRoute);
app.use("/admin",adminAuthRoute);
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
 
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};


  res.status(err.status || 500);
  res.render("error", { layout: false });
});


         
app.listen(2999, () => {
  console.log("Server is running at http://localhost:2999  http://localhost:2999/admin/login http://localhost:2999/guestUser");
});
