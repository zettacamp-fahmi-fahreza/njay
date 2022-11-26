const mongoose = require('mongoose');
const {users,transactions,recipes,ingredients} = require('../schema');
const { ApolloError} = require('apollo-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { GraphQLScalarType ,Kind} = require ('graphql');
const moment = require('moment');
const { ifError } = require('assert');
const getAvailable = require('../recipes/resolvers');
const { error } = require('console');

async function getAllTransactions(parent,{page, limit, last_name_user, recipe_name,order_status, order_date,order_date_start,order_date_end, fullName_user,isCart,sort,userFind},context,info) {
    let count = await transactions.count({status: 'active' });
    let isUser = await users.findById(context.req.payload)
    let aggregateQuery = []

    if(isCart === true){
        aggregateQuery.push(
            {$match: {
                status: 'active',
                user_id: mongoose.Types.ObjectId(context.req.payload)
            }},
            {$sort: {_id:-1}}
        )
        count = await transactions.count({status: 'active' ,user_id: mongoose.Types.ObjectId(context.req.payload)});

    }
    if(isCart === false){
        aggregateQuery.push(
            {$match: {
                status: 'active',
                // user_id: mongoose.Types.ObjectId(context.req.payload)
            }},
            {$sort: {_id:-1}}
        )
    }
    
    
    if (page){
        aggregateQuery.push({
            $skip: (page - 1)*limit
        },
        {$limit: limit})
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
        count = await transactions.count({status: 'active',"recipes.recipe_name" : new RegExp(recipe_name, "i")})

    }
    if(order_status){
        aggregateQuery.push(
        {
            $match: {"order_status" : new RegExp(order_status, "i")}
        }
        )
        count = await transactions.count({status: 'active',order_status : order_status})
    }
    if(order_date){
        aggregateQuery.push(
        {
            $match: {"order_date" :new RegExp( order_date, "i")}
            
        }
        )
        count = await transactions.count({status: 'active',order_date : new RegExp(order_date, "i")})
    }
    // if(order_date_start){
    //     // if(order_date_start === order_date_end){
    //     aggregateQuery.push(
    //         {
    //             $match: {"updatedAt" :{$gte: new Date(order_date_start)
    //         }}
    //         })
        // }else{
        //     aggregateQuery.push(
        //         {
        //             $match: {"updatedAt" :{
        //                 $gte:new Date(order_date_start), $lte: new Date(order_date_end)
                    
        //         }}
        // })
    // }
    // }

    if(order_date_start && order_date_end){
        if(order_date_start === order_date_end){
            aggregateQuery.push(
                {
                    $match: {"updatedAt" :{
                        $gte:new Date(order_date_start)
                    
                }}
                
                }
                )
                count = await transactions.count({status: 'active' ,"updatedAt" : {
                    $gte:new Date(order_date_start)
                }})
        }else{
            aggregateQuery.push(
            {
                $match: {"updatedAt" :{
                    $gte:new Date(order_date_start), $lte: new Date(order_date_end)
                
            }}
            
            }
            )
            count = await transactions.count({status: 'active' ,"updatedAt" : {
                $gte:new Date(order_date_start), $lte: new Date(order_date_end)
            }})
        }
        // if(order_date_start === order_date_end){
        //     aggregateQuery.push(
        //         {
        //             $match: {"updatedAt" :{$eq: new Date(order_date_start)
        //         }}
        //         })
        // }else{

        // }
    }
    if(sort){
        sort.createdAt === 'asc' ? aggregateQuery.push({$sort: {createdAt:1}}) : aggregateQuery.push({$sort: {createdAt:-1}})
    }
    if(isUser.role === 'user'){
        aggregateQuery.push({
            $match: {
                user_id: mongoose.Types.ObjectId(context.req.payload)
            }
        })
        if(userFind || last_name_user){
            throw new ApolloError('FooError', {
                message: 'Not Authorized!'
            });
        }
    }
    if(isUser.role === 'admin'){
        if(userFind){
            aggregateQuery.push({
                $match: {
                    user_id: mongoose.Types.ObjectId(userFind)
                }
            })
            count = await transactions.count({status: 'active' ,user_id: mongoose.Types.ObjectId(userFind)});

        }
    if(last_name_user){
        aggregateQuery.push({
                $lookup:
                {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "users"
                },

        },
        // {
        //     $addField: {
        //         "fullName" : {$concat:["$users.last_name", ", ","$users.first_name"]}
        //     }
        // },
        {
            $match: {"users.last_name" :new RegExp(last_name_user, "i")}
        }
        )
        count = await transactions.count({status: 'active',"users.last_name" : new RegExp(last_name_user, "i")})
    }

    if(fullName_user){
        aggregateQuery.push({
                $lookup:
                {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "users"
                },

        },
        
        {
            $match: {"users.fullName" :new RegExp(fullName_user, "i")}
        }
        )
        count = await transactions.count({status: 'active',"users.fullName" : new RegExp(fullName_user, "i")})
    }
    
    }
     let result = await transactions.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el._id)
                        })
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
    // console.log(arrIngredient)
    for(let ingredient of arrIngredient){
        await ingredients.findByIdAndUpdate(ingredient.ingredient_id,{
            stock: ingredient.stock
        },{
            new: true
        })
    }
}


async function validateStockIngredient(user_id, menus,checkout){
try{
    let menuTransaction = new transactions({menu : menus })
    menuTransaction = await transactions.populate(menuTransaction, {
        path: 'menu.recipe_id',
        populate: {
            path : "ingredients.ingredient_id"
        }
    })
    if(!menuTransaction.menu){
        throw new ApolloError("FooError",{
            message: "Cart is Empty"
        })
    }
    let available = 0
    let price = 0
    let totalPrice = 0
    let recipeStatus = null
    let discount = 10
    const ingredientMap = []
    // console.log(menuTransaction)
    for ( let menu of menuTransaction.menu){
        if(menu.recipe_id.status === 'unpublished'){
            // recipeName = []
            
            throw new ApolloError("FooError",{
                message: "Menu Cannot be ordered as it is Unpublished!"
            })
        }
        recipeStatus = menu.recipe_id.status
        available = menu.recipe_id.available
        price = menu.recipe_id.price
        const amount = menu.amount
        totalPrice = price * amount
        for( let ingredient of menu.recipe_id.ingredients){
                ingredientMap.push({ingredient_id: ingredient.ingredient_id,
                    stock:ingredient.ingredient_id.stock - (ingredient.stock_used * amount)})
                    // console.log(ingredient.ingredient_id.stock <= 0)
            if(ingredient.ingredient_id.stock < ingredient.stock_used * amount){
                throw new ApolloError('FooError',{
                    message: 'stock ingredient not enough'
                })
            }
        }
    }
    if(checkout == true)
    ingredientMap.forEach((el) => {
        // console.log(`ini el.stock: ${el.stock}`)
        if(el.stock < 0){
            throw new ApolloError('FooError',{
                message: 'stock ingredient not enough'
            })
        }
    })
    return new transactions({user_id: user_id, menu: menus,order_status: "pending",recipeStatus: recipeStatus,totalPrice: totalPrice,onePrice:price,available:available ,ingredientMap: ingredientMap})
    }
    catch(err){
        throw new ApolloError('FooError',err)
    }
}
// async function validateCheckout(user_id, menus){
//     try{
//         let menuTransaction = null
//         let menuu = null
//         menus.forEach(async(el) => {
//             menuu = (el)
//             // menuTransaction = new transactions({menu : el })
//             // menuTransaction = await transactions.populate(menuTransaction, {
//             //     path: 'menu.recipe_id',
//             //     populate: {
//             //         path : "ingredients.ingredient_id"
//             //     }
//             // })
//             // console.log(menuTransaction)
//         })

//         // let menuTransaction = new transactions({menu : menus })
//         // for(a of menuTransaction.menu){
//             // console.log(a)
//             // menuTransaction = await transactions.populate(menuTransaction, {
//             //     path: 'menu.recipe_id',
//             //     populate: {
//             //         path : "ingredients.ingredient_id"
//             //     }
//             // })
//         // }

//         // menuTransaction = await transactions.populate(menuTransaction, {
//         //     path: 'menu.recipe_id',
//         //     populate: {
//         //         path : "ingredients.ingredient_id"
//         //     }
//         // })
//         let available = 0
//         let price = 0
//         let totalPrice = 0
//         const ingredientMap = []
//         for ( let menu of menuTransaction.menu){
//             if(menu.recipe_id.status === 'unpublished'){
//                 throw new ApolloError("FooError",{
//                     message: `Menu ${menu.recipe_id.recipe_name} Cannot be ordered as it is Unpublished!`
//                 })
//             }
//             available = menu.recipe_id.available
//             price = menu.recipe_id.price
//             const amount = menu.amount
//             totalPrice = price * amount
//             for( let ingredient of menu.recipe_id.ingredients){
//                     ingredientMap.push({ingredient_id: ingredient.ingredient_id,
//                         stock:ingredient.ingredient_id.stock - (ingredient.stock_used * amount)})
//                 if(ingredient.ingredient_id.stock < ingredient.stock_used * amount){
//                     throw new ApolloError('FooError',{
//                         message: 'stock ingredient not enough'
//                     })
//                 }
//             }
//         }
//         return new transactions({user_id: user_id, menu: menus,order_status: "pending",totalPrice: totalPrice,onePrice:price,available:available ,ingredientMap: ingredientMap})
//         }
//         catch(err){
//             throw new ApolloError('FooError',err)
//         }
//     }

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
    const newTransaction = await validateStockIngredient(context.req.payload, args.input,false)
    await newTransaction.save()
    console.log(`Total Time Create Transaction: ${Date.now()- tick} ms`)
    return newTransaction
}

async function checkoutTransaction(parent,args,context){
    const transaction = await transactions.find({
        order_status: 'pending',
        user_id: context.req.payload
    })
    let recipeStatus = null
    order_status = null
    let menu = null
    let newTransaction = null
    transaction.forEach((el) => {
        menu = el.menu
        if(el.recipeStatus === "unpublished"){
            recipeStatus = el.recipeStatus
        }
        console.log(menu)
    })
    if(recipeStatus === "unpublished"){
        throw new ApolloError("FooError",{
            message: `Menu:
            Cannot be ordered as it is Unpublished!`
        })
    }
    newTransaction = await validateStockIngredient(context.req.payload, menu,true)
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

    if(args.note === ""){
        transaction.menu.forEach((el) => {
            note = ""
            return( el.note= note)
        })
        await transaction.save()
    return transaction
    }
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
    for(let recipe of parent.menu){
        const recipeId = await recipes.findById(recipe.recipe_id)
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