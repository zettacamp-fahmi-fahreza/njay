const express = require('express');
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    date_published: Date,
    price: Number,
    date_added: Date,
    date_updated: Date,
    updated: Number,
  })
const comics = mongoose.model('Book', bookSchema);

const bookShelvesSchema = new mongoose.Schema({
    name: String,
    books : [
        {
            type : mongoose.Schema.Types.ObjectId,
            default : '',
            ref : 'Book'
        }
    ]
})
const bookShelves = mongoose.model('bookShelves', bookShelvesSchema);

  module.exports.comics = comics;
  module.exports.bookShelves = bookShelves;

