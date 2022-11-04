const { ApolloError ,gql} = require('apollo-server-express');


const loginAuth = async (resolve, root, args, context, info) => {
    // console.log(context.req.headers.authorization)
    let token = context.req.headers.authorization
    if (typeof token !== 'undefined') {
    token == "cisi" ? context.isAuth = true : context.isAuth = false
    // console.log(context.isAuth);
    const result = await resolve(root, args, context, info)
    return result
    
    }else{
    return new ApolloError("token is null")
    }
    }
    module.exports = loginAuth