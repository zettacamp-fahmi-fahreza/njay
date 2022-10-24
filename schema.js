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
const comic = mongoose.model('Book', bookSchema);


  module.exports = comic;