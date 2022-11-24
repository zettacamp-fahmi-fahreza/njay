const mongoose = require('mongoose');
const {users,transactions,recipes,ingredients} = require('../schema');
const { ApolloError} = require('apollo-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { GraphQLScalarType ,Kind} = require ('graphql');
const moment = require('moment');
const { ifError } = require('assert');
const getAvailable = require('../recipes/resolvers')

async function getAllTransactions(parent,{page, limit, last_name_user, recipe_name,order_status, order_date, input},context,info) {
    let count = await transactions.count({status: 'active',user_id: mongoose.Types.ObjectId(context.req.payload) });
    let aggregateQuery = [
            {$match: {
                status: 'active',
                user_id: mongoose.Types.ObjectId(context.req.payload)
            }},
            {$sort: {_id:-1}}

    ]
    if (page){
        aggregateQuery.push({
            $skip: (page - 1)*limit
        },
        {$limit: limit})
    }
    if(last_name_user){
        aggregateQuery.push({
                $lookup:
                {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "users"
                }
            
        },
        {
            $match: {"users.last_name" :new RegExp(last_name_user, "i")}
        }
        )
        count = await transactions.count({"users.last_name" : new RegExp(last_name_user, "i")})

    }
    if(recipe_name){
        aggregateQuery.push({
                $lookup:
                {
                  from: "recipes",
                  localField: "menu.recipe_id",
                  foreignField: "_id",
                  as: "recipes"
                }
        },
        {
            $match: {"recipes.recipe_name" : new RegExp(recipe_name, "i")}
        }
        )
        count = await transactions.count({"recipes.recipe_name" : new RegExp(recipe_name, "i")})

    }
    if(order_status){
        aggregateQuery.push(
        {
            $match: {"order_status" : new RegExp(order_status, "i")}
        }
        )
        count = await transactions.count({order_status : new RegExp(order_status, "i")})
    }
    if(order_date){
        aggregateQuery.push(
        {
            $match: {"order_date" : moment(order_date, "MM-DD-YYYY").locale("id-ID").format("LL")}
        }
        )
        count = await transactions.count({order_date : new RegExp(order_date, "i")})
    }
    if(input){
        input.order_date === 'asc' ? aggregateQuery.push({$sort: {order_date:1}}) : aggregateQuery.push({$sort: {order_date:-1}})
    }
     let result = await transactions.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el._id)
                        })
                        // console.log(`total time: ${Date.now()- tick} ms`)
                        // if(!page){
                        //     count = result.length
                        // }
                        const max_page = Math.ceil(count/limit) || 1
                        if(max_page < page){
                            throw new ApolloError('FooError', {
                                message: 'Page is Empty!'
                            });
                        }
                return {
                count: count,
                max_page: max_page,
                page: page,
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

async function reduceIngredientStock(arrIngredient){
    for(let ingredient of arrIngredient){
        await ingredients.findByIdAndUpdate(ingredient.ingredient_id,{
            stock: ingredient.stock
        },{
            new: true
        })
    }
}


async function validateStockIngredient(user_id, menus){
try{
    let menuTransaction = new transactions({menu : menus })
    menuTransaction = await transactions.populate(menuTransaction, {
        path: 'menu.recipe_id',
        populate: {
            path : "ingredients.ingredient_id"
        }
    })
    let available = 0
    let price = 0
    let totalPrice = 0
    const ingredientMap = []
    for ( let menu of menuTransaction.menu){
        if(menu.recipe_id.status === 'unpublished'){
            throw new ApolloError("FooError",{
                message: "Menu Cannot be ordered as it is Unpublished!"
            })
        }
        available = menu.recipe_id.available
        price = menu.recipe_id.price
        const amount = menu.amount
        totalPrice = price * amount
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
    return new transactions({user_id: user_id, menu: menus,order_status: "pending",totalPrice: totalPrice,onePrice:price,available:available ,ingredientMap: ingredientMap})
    }
    catch(err){
        throw new ApolloError('FooError',err)
    }
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
    console.log(`Total Time Create Transaction: ${Date.now()- tick} ms`)
    return newTransaction
}

async function checkoutTransaction(parent,args,context){
    const transaction = await transactions.find({
        order_status: 'pending',
        user_id: context.req.payload
    })
    order_status = null
    let menu = null
    let newTransaction = null
    transaction.forEach(async(el) => {
        menu = el.menu
    })
    newTransaction = await validateStockIngredient(context.req.payload, menu)
    reduceIngredientStock(newTransaction.ingredientMap)
    transaction.forEach(async(el) => {
        el.order_status= 'success'
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
    if(args.note){
        transaction.menu.forEach((el) => {
        note = args.note
        return( el.note= note)
    })
    await transaction.save()
    return transaction
}
    if(args.option === 'delete'){
        const updateTransaction = await transactions.findByIdAndUpdate(args.id,{
            status: 'deleted'
        }, {
            new : true
        })
        const data = await transactions.findById(args.id)
        if(updateTransaction)return data    }
    if(args.option === 'push'){
        const updateTransaction = await transactions.findOneAndUpdate(
                {_id: args.id,},
                {$set: {  
                    "totalPrice": transaction.totalPrice + transaction.onePrice,                  
                    "menu":{
                        "amount": amount + 1,
                        "recipe_id": recipeId,
                        "note": note
                    },
                },
            },
            {new : true}
                )
const data = await transactions.findById(args.id)
            // console.log(data.available)
            data.menu.forEach((amount) => {
                if(amount > data.available){
                    throw new ApolloError('FooError',{
                        message: 'Insufficient Stock'})
                }
            })
    if(updateTransaction)return data
    }

    if(args.option === 'pull'){
        const updateTransaction = await transactions.findOneAndUpdate(
                {_id: args.id},
                {$set: {
                    "totalPrice": transaction.totalPrice - transaction.onePrice,                  
                    "menu":{
                        "amount": amount - 1,
                        "recipe_id": recipeId,
                        "note": note
                    }
                }
            },{new : true}
                )
            const data = await transactions.findById(args.id)
            if(updateTransaction)return data
            }
    
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
    });
}

async function availableLoader(parent, args, context, info) {
    const minStock = []
    // console.log(parent)
    for(let recipe of parent.menu){
        const recipeId = await recipes.findById(recipe.recipe_id)
        // console.log(recipeId)
         for (let ingredient of recipeId.ingredients) {
        const recipe_ingredient = await ingredients.findById(ingredient.ingredient_id);
        if (!recipe_ingredient) throw new ApolloError(`Ingredient with ID: ${ingredient.ingredient_id} not found`, "404");
        minStock.push(Math.floor(recipe_ingredient.stock / ingredient.stock_used));
    }
    return Math.min(...minStock);
        
    }
   
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
        user_id : getUserLoader,
        available: availableLoader
    },
    Menu: {
        recipe_id: getRecipeLoader
    }

}
module.exports = resolverTransaction