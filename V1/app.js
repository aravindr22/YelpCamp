require('dotenv').config()

var port = process.env.PORT,
    express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStratergy = require("passport-local"),
    methodOverride = require("method-override"),        //for put and delete methods
    flash = require("connect-flash"),
    User = require("./models/user"),
    seedDB = require("./seeds");

var booksRoutes = require("./routes/book"),
    commentRoutes = require("./routes/comment"),
    indexRoutes = require("./routes/index"),
    reviewRoutes = require("./routes/review");

    
mongoose.connect(process.env.MONGODB, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
//mongoose.connect("", { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
app.use(express.static(__dirname + "/public"));
app.use("/public", express.static('./public/'));
app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //Seed the database

//Passport Config
app.use(require("express-session")({
    secret: "This is my first web page",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.authenticate('local', { failureFlash: 'Invalid username or password.' });
passport.authenticate('local', { successFlash: 'Welcome to BookCamp!!' });

//passing the current user data to all the routes
app.use(function (req, res, next) {
    res.locals.currentuser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/",indexRoutes);
app.use("/books",booksRoutes);
app.use("/books/:id/comments",commentRoutes);
app.use("/books/:id/reviews", reviewRoutes);

//---------------------------------LISTNER--------------------------------------

app.listen(port ,function () {
    console.log("Server has started");
});
