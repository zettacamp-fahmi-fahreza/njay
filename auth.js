
const jwt = require('jsonwebtoken');

const { ApolloError} = require('apollo-errors');

async function authMiddleware(resolve,parent,args,context,info) {
    const token = context.req.headers.authorization || ''
    if(!token){
        throw new ApolloError('FooError', {
            message: 'Not Authorized!'
    })}
    // const decode = context.req.payload.authorization.id
    jwt.verify(token,'zetta',(err,decoded)=>{
        if(err){
            throw new ApolloError(err)
        }
        // console.log(decoded)


        context.req.payload = decoded.id
        // console.log(context.req.payload)
    })
    // console.log(decode)
    return resolve(parent,args,context,info)
}

module.exports = {
    Query: {
        getOneUser: authMiddleware,
        getAllUsers: authMiddleware,
        getOneIngredient: authMiddleware,
        getAllIngredient: authMiddleware,
        getOneRecipe: authMiddleware,
        getAllRecipes: authMiddleware,
        getOneTransaction: authMiddleware,
        getAllTransactions: authMiddleware,
    },
    Mutation: {
        addUser: authMiddleware,
        updateUser: authMiddleware,
        deleteUser: authMiddleware,
        addIngredient: authMiddleware,
        updateIngredient: authMiddleware,
        deleteIngredient: authMiddleware,
        deleteRecipe: authMiddleware,
        updateRecipe: authMiddleware,
        createRecipe: authMiddleware,
        createTransaction: authMiddleware,
        deleteTransaction: authMiddleware,
    }
}

