const Book = require("../models/book");
const viewBalancerHelper = require("../helpers/viewbalancer");
const updateTimeHelper = require("../helpers/updateTime");
const createTimeHelper = require("../helpers/createTime");

var cloudinary = require("cloudinary");
cloudinary.config({ 
    cloud_name: 'dbbinc37j', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//Index Page
exports.indexPage = function(req, res){
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Book.find({ name: regex }, function (err, allbook) {
            if (err) {
                console.log(err);
            } else {              
                if (allbook.length < 1) {
                    var noMatch = "No Book Matched that Query, Please Try again..";                    
                }
                res.render("campindex", { book: allbook, currentuser: req.user, noMatch: noMatch });
            }
        });
    } else {
        Book.find({}, function (err, allbook) {
            if (err) {
                console.log(err);
            } else {
                res.render("campindex", { book: allbook, currentuser: req.user });
            }
        }).sort({ "popularity": -1 });  //Sort by popularity in descending order
    }
}

//Post req submission for new Book
exports.createBookPostreq = async function(req,res){
    console.log("----------------");
    await cloudinary.uploader.upload(req.file.path, function(result){
        console.log(result);
        req.body.image = result.secure_url;
    })
    console.log("------------------------------");
    console.log(req.body)
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var date = createTimeHelper.createTime();
    var newbook = { 
        name: name, 
        image: image, 
        description: description, 
        author: author, 
        price: price,
        createdAt: date
    };
    Book.create(newbook, function (err, newbook) {
        if (err) {
            console.log(err);
        } else {
            console.log(">--------------------------------------------------------New book Created");
            console.log(newbook);
            req.flash("success", "Book Created Successfully");
            res.redirect("/books/" + newbook._id);
        }
    });
}

//Form for new Book
exports.createBookForm = function(req, res){
    res.render("campnew");
}

//View Book
exports.viewBook = function(req, res){
    Book.findById(req.params.id).populate("comments").exec(function (err, foundbook) {
        if (err) {
            console.log(err);
        } else {            
            foundbook.popularity = foundbook.popularity + 0.05;
            foundbook.views = foundbook.views + 1;
            foundbook.save();
            console.log(">--------------------------------------------------------Viewing book");
            console.log(foundbook);
            res.render("campshow", { book: foundbook });
        }
    });
}

//Edit book
exports.editBook = function(req, res){
    Book.findById(req.params.id, function (err, foundbook) {
        res.render("campedit", { book: foundbook });
    });
}

//Update Book
exports.updateBook = function(req, res){
    Book.findByIdAndUpdate(req.params.id, req.body.book, function (err, updatedata) {
        if (err) {
            console.log(err);
            res.redirect("/books");
        } else {
            console.log(">--------------------------------------------------------Book Updated");
            viewBalancerHelper.viewBalancer(req.params.id);
            updateTimeHelper.updateTime("book", req.params.id);
            req.flash("success", "Book Details Edited Succesfully");
            res.redirect("/books/" + req.params.id);
        }
    });
}

//Delete Book
exports.deleteBook = function(req, res){
    Book.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) {
            console.log(err);
            res.redirect("/books");
        } else {
            console.log(">--------------------------------------------------------Deleted Book");
            console.log(data);
            req.flash("success", "Book Details Deleted Succesfully");
            res.redirect("/books");
        }
    });
}