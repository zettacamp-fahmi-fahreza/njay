const { ApolloServer,gql } = require('apollo-server');
const mongoose = require('mongoose');
const {users,ingredients,recipes} = require('./schema');
const { ApolloError} = require('apollo-errors');
const { constants } = require('picomatch');
const jwt = require('jsonwebtoken');
const { message } = require('statuses');
const bcrypt = require('bcrypt');
const {merge} = require('lodash')
const DataLoader = require('dataloader');
const ingredientLoader = require('./loader.js');
const { ifError } = require('assert');
// async function getHash (){
//     const pengguna = await users.find({});
//     pengguna.forEach(async (user)=>{
//         if(user.password.length < 10){
//             user.password = await bcrypt.hash(user.password,5)
//         }
//         await user.save()
//     })
// }
// // getHash()

async function addUser(parent,args, context, info){
    args.password = await bcrypt.hash(args.password, 5)
    const newUser = new users(args)
    // await newUser.save()
    console.log(newUser)
    return newUser;
}

function verifyJwt(context){
    const token = context.req.headers.authorization || ''
    if(!token){
        throw new ApolloError('FooError', {
            message: 'Not Authorized!'
          });
    }
    jwt.verify(token, 'zetta',(err,decoded)=>{
        if(err){
            throw new ApolloError(err)
        }
        console.log(decoded);
    })
}

async function getAllUsers(parent,args, context){
    // const getAll = await users.find()
    // return getAll
    verifyJwt(context)
    let count = await users.count();
    let aggregateQuery = []
    if(args.length==0){
        aggregateQuery.push({
            $project: {id:1,first_name:1}
        })
    }
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
        
    }
    if(args.email){
        aggregateQuery.push({
            $match: {email: args.email}
        },{
            $sort: {email: 1}
        })
    }
    if(args.last_name){
        aggregateQuery.push({
            $match: {last_name: new RegExp(args.last_name, "i") }
        },{
            $sort: {last_name: 1}
        })
    }
    if(args.first_name){
        aggregateQuery.push({
            $match: {first_name:  new RegExp(args.first_name, "i") }
        },{
            $sort: {first_name: 1}
        })
    }
    
            if(aggregateQuery.length === 0){
                let result = await users.find()
                result.forEach((el)=>{
                    el.id = mongoose.Types.ObjectId(el.id)
                })
                return {
                    count: count,
                    // page: 0,
                    users: result
                    };
            }
            let result = await users.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el.id)
                        })
                        // console.log(result);
                return {
                count: count,
                page: args.page,
                users: result
                };
            
}
async function getOneUser(parent,args, context){
    if(args.id){
        const getUser = await users.findById(args.id)
        return getUser
    }else if(args.email){
        const getUser = await users.findOne({
            email: args.email
        })
        return getUser
    }else{
        return new ApolloError('FooError', {
            message: 'Put at least one parameter!'
          });
    }
}
async function updateUser(parent, args,contect){
    
    // console.log(updateUser.password)
    
      if(!args.password){
        throw new ApolloError('FooError', {
            message: 'Password is Needed!'
          });
    }
    args.password = await bcrypt.hash(args.password, 5)
    const updateUser = await users.findByIdAndUpdate(args.id, args,{
        new: true
    })
    if(updateUser){
        return updateUser
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}
async function deleteUser(parent, args,context){
    const deleteUser = await users.findByIdAndUpdate(args.id,{
        status: 'deleted'
    }, {
        new : true
    })
    if(deleteUser){
        return {deleteUser, message: 'User Has been deleted!', data: deleteUser}
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
    
}
async function getToken(parent, args,context){
    // const email = await u

    const userCheck = await users.findOne({email: args.email})
    if(!userCheck){
        return new ApolloError('FooError', {
            message: 'Email Not Found !'
          });
    }
    const getPassword = await bcrypt.compare(args.password, userCheck.password )
    if(!getPassword){
        throw new ApolloError('FooError', 
        {message: "Wrong password!"})
    }
    const token = jwt.sign({ email: args.email, id: args.id},'zetta',{expiresIn:'1h'});
    return{message: token}
}

//ADA MASALAH EMPTY PIPELINE DISINI JUGA
async function getAllIngredient(parent,args,context){
    let count = await ingredients.count();
    let aggregateQuery = []
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
    }
    if(args.name){
        aggregateQuery.push({
            $match: {name: new RegExp(args.name, "i")}
        },{
            $sort: {name: 1}
        })
    }
    if(args.stock && args.stock>0){
        aggregateQuery.push({
            $match: {stock: {$gte :args.stock}}
        },{
            $sort: {stock: 1}
        })
    }
    if(args.stock <= 0){
        throw new ApolloError('FooError', {
            message: 'Stock Cannot Be Zero!'
          });
    }
    if(aggregateQuery.length === 0){
        let result = await ingredients.find()
        result.forEach((el)=>{
            el.id = mongoose.Types.ObjectId(el.id)
        })
        return {
            count: count,
            // page: 0,
            data: result
            };
    }
    let result = await ingredients.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el.id)
                        })
                        console.log(result);
                return {
                count: count,
                page: args.page,
                data: result
                };
}
async function addIngredient(parent,args,context){
    const newIngredient = new ingredients(args)
    await newIngredient.save()
    // console.log(newIngredient)
    return newIngredient;
}
async function getOneIngredient(parent,args,context){
    const getOneIngredient = await ingredients.findById(args.id)
    return getOneIngredient
}
async function updateIngredient(parent,args,context){
    if(args.stock <= 0){
        throw new ApolloError('FooError', {
            message: 'Stock Cannot be 0 or less!'
          });
    }
    const updateIngredient = await ingredients.findByIdAndUpdate(args.id, args,{
        new: true
    })
    // console.log(updateIngredient.id)
    if(updateIngredient){
        return updateIngredient
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}
async function deleteIngredient(parent,args,context) {
    const deleteIngredient = await ingredients.findByIdAndUpdate(args.id,{
        status: 'deleted'
    }, {
        new : true
    })
    if(deleteIngredient){
        return {deleteIngredient, message: 'Ingredient Has been deleted!', data: deleteIngredient}
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}
async function getAllRecipes(parent,args,context,info) {
    let count = await recipes.count();
    let aggregateQuery = []
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
    }
    if(args.recipe_name){
        aggregateQuery.push({
            $match: {recipe_name: new RegExp(args.recipe_name, "i")}
        },{
            $sort: {recipe_name: 1}
        })
    }
    if(aggregateQuery.length === 0){
        let result = await recipes.find()
        result.forEach((el)=>{
            el.id = mongoose.Types.ObjectId(el.id)
        })
        return {
            count: count,
            // page: 0,
            data: result
            };
    }
    let result = await recipes.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el.id)
                        })
                        console.log(result);
                return {
                count: count,
                page: args.page,
                data: result
                };
    const getAll = await recipes.find()
    return getAll
}
async function createRecipe(parent,args,context,info){
    const recipe= {}
    recipe.recipe_name = args.recipe_name
    recipe.ingredients = []
    args.input.forEach((ingredient) => {
        recipe.ingredients.push(ingredient)
    })
    // const new recipes(recipe).save;
    // const newRecipe = new recipes(recipe)


    // console.log(newRecipe)
    // newRecipe.id = mongoose.Types.ObjectId(newRecipe._id)
    const newRecipe = await recipes.create(recipe)
    console.log(newRecipe);
    return newRecipe
}
async function getOneRecipe(parent,args,context){
    const getOne = await recipes.findById(args.id)
    if(!getOne){
        return new ApolloError("FooError",{
            message: "Wrong ID!"
        })
    }
    return getOne
}
async function getIngredientLoader(parent, args, context){

    if (parent.ingredient_id){
        let check = await context.ingredientLoader.load(parent.ingredient_id)
        return check
    }
}
const resolverUser  = {
    Query: {
        getAllUsers,
        getOneUser,
    },
    Mutation: {
        addUser,
        updateUser,
        deleteUser,
        getToken,
    }
}
const resolverIngredient = {
    Query: {
        getOneIngredient,
        getAllIngredient,
    },
    Mutation: {
        addIngredient,
        updateIngredient,
        deleteIngredient,
    }
}
const resolverRecipe = {
    Query: {
        
        getOneRecipe,
        getAllRecipes
    },
    Mutation: {
        
       
        createRecipe
    },
    ingredientId: {
        ingredient_id: getIngredientLoader
    }

}
const resolvers = merge(
   resolverUser,
   resolverIngredient,
   resolverRecipe
)
 
module.exports = {resolvers}