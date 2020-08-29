/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var ObjectId = require("mongodb").ObjectId;
var mongoose = require("mongoose");
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

// Schema and model
var Schema = mongoose.Schema;
var BookSchema = new Schema({
  title: { type: String, required: true },
  comments: [String]
});
var Book = mongoose.model("Book", BookSchema);

module.exports = function(app) {
  mongoose.connect(MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  app
    .route("/api/books")
    .get(function(req, res) {
      //make an array to add each doc into, along with making the commentcount property for each book
      let bookArray = [];
      Book.find({}, (err, data) => {
        if (!err && data) {
          data.forEach(item => {
            let book = item.toJSON();
            book.commentcount = book.comments.length;
            bookArray.push(book);
          });
          return res.json(bookArray);
        }
      });
    })

    .post(function(req, res) {
      //making the new book based off the model and saving it to the database
      var title = req.body.title;
      if (!title) {
        return res.json("No title provided");
      }
      let newBook = new Book({
        title: title,
        comments: []
      });
      newBook.save((err, book) => {
        if (!err && book) {
          return res.json(book);
        }
      });
    })

    .delete(function(req, res) {
      //removing all entries is done in the following
      Book.remove({}, (err, data) => {
        if (err) {
          console.warn(err);
        } else {
          return res.json("complete delete successful");
        }
      });
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      Book.findById(bookid, (err, book) => {
        if (!err && book) {
          return res.json(book);
        } else if (!book) {
          return res.json("no book exists");
        }
      });
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //if there was no book found, no book exists will be returned, otherwise the entry is updated
      Book.findByIdAndUpdate(
        bookid,
        { $push: { comments: comment } },
        { new: true },
        (err, book) => {
          if (!err && book) {
            return res.json(book);
          } else if (!book) {
            return res.json("no book exists");
          }
        }
      );
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful', otherwise no book exists if there was no such book
      Book.findByIdAndRemove(bookid, (err, book) => {
        if (!err && book) {
          return res.json("delete successful");
        } else if (!book) {
          return res.json("no book exists");
        }
      });
    });
};
