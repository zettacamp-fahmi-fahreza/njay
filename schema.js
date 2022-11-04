const express = require("express");
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    date_published: Date,
    price: Number,
    date_added: Date,
    date_updated: Date,
    updated: Number,
    stock: Number,
});

const objDate = new Date();
const comics = mongoose.model("Book", bookSchema);

const bookShelvesSchema = new mongoose.Schema(
    {
        name: String,
        books: [
            {
                book_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: "",
                    ref: "Book",

                },
                added_date: {
                    type: Date,
                },
                stock: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        date: [
            {
                _id: false,
                date: {
                    type: Date,
                    //   default: new Date(),
                },
                time: {
                    type: String,
                    default: `${objDate.getHours()}:${objDate.getMinutes()}`,
                },
            },
        ],
    },
    { timestamps: true },
    { strict: false }
);
const bookShelves = mongoose.model("bookShelves", bookShelvesSchema);

module.exports.comics = comics;
module.exports.bookShelves = bookShelves;
