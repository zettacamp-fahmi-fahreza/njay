
const jwt = require('jsonwebtoken');
const {users} = require('./schema');
const { ApolloError} = require('apollo-errors');
const { message } = require('statuses');

async function testMiddleware(resolve,parent,args,context,info) {
    const user_id= context.req.payload

    const user = await users.findById(user_id)
    if(user.role === "user"){
        throw new ApolloError('FooError',{
        message: "User Cannot Acces This Page"})
    }
    console.log(user.role)
    return resolve(parent,args,context,info)
}

module.exports = {
    Query: {
        getOneUser: testMiddleware,
        getAllUsers: testMiddleware,
        getOneIngredient: testMiddleware,
        getAllIngredient: testMiddleware,
        getOneRecipe: testMiddleware,
        // getAllRecipes: testMiddleware,
        getOneTransaction: testMiddleware,
        getAllTransactions: testMiddleware,
    },
    Mutation: {
        addUser: testMiddleware,
        updateUser: testMiddleware,
        deleteUser: testMiddleware,
        addIngredient: testMiddleware,
        updateIngredient: testMiddleware,
        deleteIngredient: testMiddleware,
        deleteRecipe: testMiddleware,
        updateRecipe: testMiddleware,
        createRecipe: testMiddleware,
        deleteTransaction: testMiddleware,
    }
}

