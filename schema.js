const { Enum } = require('@apollo/protobufjs')
const express = require('express')
const mongoose = require('mongoose')
const moment = require('moment')

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
    userType:{
        userType_permission:[
            {name:{
                type: String,
                trim:true,
                required: true
            },
        view:{
            type: Boolean,
            trim:true,
            required: true
        }
        }
        ]
        
    }
    ,
    
    status: {
        type: String,
        enum: ['active','deleted'],
        default: 'active'
    },
    role: {
        type: String,
        enum: ['user','admin'],
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
        trim: true,
        unique: true
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
    price : {
        type: Number,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "deleted"],
        default: 'active'
    },
    category: {
        type: String,
        enum: ["food", "drink"]
    },
    img: {
        type: String,
        required: true
    },
    description: {
        type: String,
        // trim: true,
        required: true
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
                type: String
            }
        }
    ],
    order_status: {
        type: String,
        enum: ["success", "failed"],
        default: "failed"
    },
    order_date: {
        type : String,
        default : moment(new Date()).locale("id-ID").format("LL")
    },
    status: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active'
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0

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
    transactions
}