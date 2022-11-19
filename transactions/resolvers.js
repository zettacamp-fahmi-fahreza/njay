const mongoose = require('mongoose');
const {users,transactions,recipes,ingredients} = require('../schema');
const { ApolloError} = require('apollo-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { GraphQLScalarType ,Kind} = require ('graphql');
const moment = require('moment');
const { ifError } = require('assert');

async function getAllTransactions(parent,args,context,info) {
    let count = await transactions.count();
    let aggregateQuery = [
        
            {$match: {
                status: 'active',
                user_id: mongoose.Types.ObjectId(context.req.payload)
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
        count = await transactions.count({order_status : new RegExp(args.order_status, "i")})
        console.log(count)
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
    console.log(parent)
    if (parent.recipe_id){
        let check = await context.recipeLoader.load(parent.recipe_id)
        // console.log(check)
        return check
    }
}

// async function validateStockIngredient(){
//     let checkId = 
// }
async function reduceIngredientStock(arrIngredient){
    for(let ingredient of arrIngredient){
        // console.log(ingredient)
        await ingredients.findByIdAndUpdate(ingredient.ingredient_id,{
            stock: ingredient.stock
        },{
            new: true
        })
        // console.log(ingredient.stock)

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
        if(menu.recipe_id.status === 'unpublished'){
            throw new ApolloError("FooError",{
                message: "Menu Cannot be ordered as it is Unpublished!"
            })
        }
        const amount = menu.amount
        totalPrice = menu.recipe_id.price * amount
        for( let ingredient of menu.recipe_id.ingredients){
                ingredientMap.push({ingredient_id: ingredient.ingredient_id,
                    stock:ingredient.ingredient_id.stock - (ingredient.stock_used * amount)})
            if(ingredient.ingredient_id.stock < ingredient.stock_used * amount){
                throw new ApolloError('FooError',{
                    message: 'stock ingredient not enough'
                })
            }
        }
    }
    // await reduceIngredientStock(ingredientMap)
    return new transactions({user_id: user_id, menu: menus,order_status: "pending",totalPrice: totalPrice, ingredientMap: ingredientMap})
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
    console.log("iin Create Transaction")
    return newTransaction
}

async function checkoutTransaction(parent,args,context){
    const transaction = await transactions.find({
        order_status: 'pending',
        user_id: context.req.payload
    })
    transaction.forEach((ingredient) => {
        reduceIngredientStock(ingredient.ingredientMap)
        ingredient.order_status = 'success'
        // console.log(ingredient)
    })
    await transactions.create(transaction)
    return transaction
}
async function updateTransaction(parent,args,context){
    let transaction = await transactions.findById(args.id)
    let amount = 0
    let recipeId = ""
    let note = ""
    transaction.menu.forEach((el) => {
        amount = el.amount
        recipeId = el.recipe_id
        note = el.note
    })
    console.log(amount)
    if(args.note){
        transaction.menu.forEach((el) => {
        note = args.note
        return( el.note= note)
    })
}
    if(args.option === 'delete'){
        const updateTransaction = await transactions.findByIdAndUpdate(args.id,{
            status: 'deleted'
        }, {
            new : true
        })
    if(updateTransaction)return updateTransaction
    }
    if(args.option === 'push'){
        const updateTransaction = await transactions.findOneAndUpdate(
                {_id: args.id,},
                {$set: {
                    "menu":{
                        "amount": amount + 1,
                        "recipe_id": recipeId,
                        "note": note
                    }
                }
            },
            // {
            //     arrayFilters:[ {"element.recipe_id" :{$eq: "636dae7d54dc248b764e7f7d"}}]
            // },
            {new : true}
                )
        
                
    // transaction.totalPrice = transaction.menu.recipe_id.price * amount
    // console.log(transaction.menu)

    if(updateTransaction)return transaction
    }

    if(args.option === 'pull'){
        const updateTransaction = await transactions.findOneAndUpdate(
                {_id: args.id},
                {$set: {
                    "menu":{
                        "amount": amount - 1,
                        "recipe_id": recipeId,
                        "note": note
                    }
                }
            },{new : true}
                )
    if(updateTransaction)return transaction
    }
    

   
    
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}

const resolverTransaction = {
    Mutation : {
        createTransaction,
        updateTransaction,
        checkoutTransaction
        
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