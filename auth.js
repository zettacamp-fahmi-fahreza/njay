
const jwt = require('jsonwebtoken');

const { ApolloError} = require('apollo-errors');

async function authMiddleware(resolve,parent,args,context,info) {
    const token = context.req.headers.authorization || ''
    if(!token){
        throw new ApolloError('FooError', {
            message: 'Not Authorized!'
    })}
    jwt.verify(token,'zetta',(err,decoded)=>{
        if(err){
            throw new ApolloError(err)
        }
    })
    return resolve(parent,args,context,info)
}

module.exports = {
    Query: {
        getOneUser: authMiddleware,
        getAllUsers: authMiddleware,
        getOneIngredient: authMiddleware,
        getAllIngredient: authMiddleware,
    }
}

