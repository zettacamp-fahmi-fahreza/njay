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
const recipesSchema = new mongoose.Schema({
    recipe_name:{
        type: String,
        required: true,
        trim: true
    } ,
    ingredients: [
        {
            ingredient_id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Ingredients",
                required: true,
                unique: false
            },
            stock_used: {
                type: Number,
                required: true,
            }
        }
    ],
    status: {
        type: String,
        enum: ["active", "deleted"],
        default: 'active'
    }
})

const transactionsSchema = new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    menu: [
        {
            recipe_id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Recipes",
                required: true
            },
            amount: {
                type: Number,
                required: true,
            },
            note: {
                type: String,
                required: true
            }
        }
    ],
    order_status: {
        type: String,
        enum: ["success", "failed"]
    },
    order_date: {
        type : Date,
        default : new Date()
    },
    status: {
        type: String,
        enum: ['active', 'deleted']
    }
})

const users = mongoose.model("Users", userSchema)
const ingredients = mongoose.model("Ingredients", ingredientsSchema)
const recipes = mongoose.model("Recipes", recipesSchema)
const transactions = mongoose.model("Transactions", transactionsSchema)



module.exports = {
    users,
    ingredients,
    recipes,
    transactionsSchema
}