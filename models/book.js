var mongoose = require("mongoose");

//Book Schema Setup

var bookSchema = new mongoose.Schema({
    name: { type: String, default: null},
    image: { type: String, default: null},
    price: { type: Number, default: 0 },
    description: { type: String, default: null},
    views: { type: Number, default: 0 },
    popularity: { type: Number, default: 10 },
    author: {
        id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        },
        username: String,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("book", bookSchema);