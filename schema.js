const { Enum } = require('@apollo/protobufjs')
const express = require('express')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    password : {
        type: String,
        required: true,
        trim:true
    },
    email : {
        type: String,
        unique: true,
        required: true,
        trim:true
    },
    last_name: {
        type: String,
        required: true,
        trim:true
    },
    first_name: {
        type: String,
        required: true,
        trim:true
    },
    status: {
        type: String,
        enum: ['active','deleted'],
        default: 'active'
    }
})
const users = mongoose.model("Users", userSchema)

const ingredientsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    stock: {
        type: Number,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "deleted"],
        default: 'active'
    }
})

const ingredients = mongoose.model("Ingredients", ingredientsSchema)



module.exports = {
    users,
    ingredients
}