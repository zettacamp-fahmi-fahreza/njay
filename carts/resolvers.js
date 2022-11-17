const mongoose = require('mongoose');
const {users,transactions,recipes,ingredients} = require('../schema');
const { ApolloError} = require('apollo-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { GraphQLScalarType ,Kind} = require ('graphql');
const moment = require('moment');

async function getAllTransactions(parent,args,context,info) {
    let count = await transactions.count();
    let aggregateQuery = [
        
            {$match: {
                status: 'active'
            }}
        
    ]
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
    }
    if(args.last_name_user){
        aggregateQuery.push({
            // usersLookup
                $lookup:
                {
                  from: "users",
                  localField: "user_id",
                  foreignField: "_id",
                  as: "users"
                }
        },
        {
            $match: {"users.last_name" :new RegExp(args.last_name_user, "i")}
        }
        )
    }
    if(args.recipe_name){
        aggregateQuery.push({
            // usersLookup
                $lookup:
                {
                  from: "recipes",
                  localField: "menu.recipe_id",
                  foreignField: "_id",
                  as: "recipes"
                }
            
        },
        {
            $match: {"recipes.recipe_name" : new RegExp(args.recipe_name, "i")}
        }
        )
    }
    if(args.order_status){
        aggregateQuery.push(
        {
            $match: {"order_status" : new RegExp(args.order_status, "i")}
        }
        )
    }
    if(args.order_date){

        aggregateQuery.push(
        {
            $match: {"order_date" : moment(args.order_date, "MM-DD-YYYY").locale("id-ID").format("LL")}
        }
        )
    }
    // if(aggregateQuery.length === 0){
    //     let result = await transactions.find()
    //     result.forEach((el)=>{
    //         el.id = mongoose.Types.ObjectId(el.id)
    //     })
    //     return {
    //         count: count,
    //         // page: 0,
    //         data: result
    //         };
    // }
    let result = await transactions.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el._id)
                        })
                return {
                count: count,
                page: args.page,
                data: result
                };
}
async function getOneTransaction(parent,args,context){
    const getOne = await transactions.findById(args.id)
    if(!getOne){
        return new ApolloError("FooError",{
            message: "Wrong ID!"
        })
    }
    return getOne
}
async function getUserLoader(parent,args,context){
    if (parent.user_id){
        let check = await context.userLoader.load(parent.user_id)
        return check
    }
}
async function getRecipeLoader(parent,args,context){
    if (parent.recipe_id){
        let check = await context.recipeLoader.load(parent.recipe_id)
        return check
    }
}

// async function validateStockIngredient(){
//     let checkId = 
// }
async function reduceIngredientStock(arrIngredient){
    for(let ingredient of arrIngredient){
        await ingredients.findByIdAndUpdate(ingredient.id,{
            stock: ingredient.stock
        })
    }
}

async function validateStockIngredient(user_id, menus){
    let menuTransaction = new transactions({menu : menus })
    menuTransaction = await transactions.populate(menuTransaction, {
        path: 'menu.recipe_id',
        populate: {
            path : "ingredients.ingredient_id"
        }
    })
    let totalPrice = 0
    const ingredientMap = []
    for ( let menu of menuTransaction.menu){
        const amount = menu.amount
        totalPrice = menu.recipe_id.price * amount
        for( let ingredient of menu.recipe_id.ingredients){
                ingredientMap.push({id: ingredient.ingredient_id,
                    stock:ingredient.ingredient_id.stock - (ingredient.stock_used * amount)})
            if(ingredient.ingredient_id.stock < ingredient.stock_used * amount){
                return new transactions({user_id: user_id, menu: menus})
            }
        }
    }

    await reduceIngredientStock(ingredientMap)
    return new transactions({user_id: user_id, menu: menus,order_status: "success",totalPrice: totalPrice})
}

async function createTransaction(parent,args,context){
    const tick = Date.now()
    if(args.input.length == 0){
        throw new ApolloError('FooError', {
            message: "Input cannot be empty!"
        })
    }
    const transaction = {}
    transaction.user_id = context.req.payload
    transaction.menu = args.input

    const newTransaction = await validateStockIngredient(context.req.payload, args.input)
    await transactions.create(newTransaction)
    // reduceIngredientStock(newTransaction)
    console.log(`Total Time: ${Date.now()- tick} ms`)
    return newTransaction
}
// async function addCart(parent,args,context){
//     const tick = Date.now()
//     if(args.input.length == 0){
//         throw new ApolloError('FooError', {
//             message: "Input cannot be empty!"
//         })
//     }
//     const transaction = {}
//     transaction.user_id = context.req.payload
//     transaction.menu = args.input

//     const newTransaction = await validateStockIngredient(context.req.payload, args.input)
//     await transactions.create(newTransaction)
//     // reduceIngredientStock(newTransaction)
//     console.log(`Total Time: ${Date.now()- tick} ms`)
//     return newTransaction
// }
async function deleteTransaction(parent,args,context){
    const deleteTransaction = await transactions.findByIdAndUpdate(args.id,{
        status: 'deleted'
    }, {
        new : true
    })
    if(deleteTransaction){

        return deleteTransaction
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}

const resolverTransaction = {
    Mutation : {
        createTransaction,
        deleteTransaction
    },
    Query : {
        getOneTransaction,
        getAllTransactions
    },
    Transaction: {
        user_id : getUserLoader
    },
    Menu: {
        recipe_id: getRecipeLoader
    }
}
module.exports = resolverTransaction