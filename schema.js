// const { Enum } = require('@apollo/protobufjs')
const express = require('express')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    password : {
        type: String,
    },
    email : {
        type: String,
        unique: true
    },
    last_name: String,
    first_name: String,
})
const users = mongoose.model("Users", userSchema)





module.exports = {
    users
}