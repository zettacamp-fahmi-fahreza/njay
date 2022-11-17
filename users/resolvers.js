const mongoose = require('mongoose');
const {users} = require('../schema');
const { ApolloError} = require('apollo-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validateStockIngredient = require('../transactions/resolvers');

// const admin_permission = [
//         "getAllUsers",
//         "getOneUser",
//         "addUser",
//         "updateUser",
//         "deleteUser",
//         "getToken",
//         "createTransaction",
//         "deleteTransaction",
//         "getOneTransaction",
//         "getAllTransactions",
//         "getOneRecipe",
//         "getAllRecipes",
//         "deleteRecipe",
//         "updateRecipe",
//         "createRecipe",
//         "getOneIngredient",
//         "getAllIngredient",
//         "addIngredient",
//         "updateIngredient",
//         "deleteIngredient"
// ]
// const user_permission = 
// [
//     "getToken",
//     "createTransaction"
//   ]

async function addUser(parent,args, context, info){
    args.password = await bcrypt.hash(args.password, 5)
    
    const newUser = new users(args)
    // if (args.role === 'user'){
    //     newUser.user_permission = user_permission
    // }else{
    //     newUser.user_permission = admin_permission
    // }
    await newUser.save()
    return newUser;
}




async function getAllUsers(parent,args, context){
    // const getAll = await users.find()
    // return getAll
    // verifyJwt(context)
    console.log(args.input.email === 'asc',typeof args.input.email)
    let count = await users.count();
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
    if(args.email){
        aggregateQuery.push({
            $match: {email: args.email}
        },
        // {
        //     $sort: {email: 1}
        // }
        )
    }
    if(args.input){
        args.input.email ? args.input.email === 'asc' ? aggregateQuery.push({$sort: {email:1}}) : aggregateQuery.push({$sort: {email:-1}}): null
        args.input.first_name ? args.input.first_name === 'asc' ? aggregateQuery.push({$sort: {first_name:1}}) : aggregateQuery.push({$sort: {first_name:-1}}) : null
        args.input.last_name ? args.input.last_name === 'asc' ? aggregateQuery.push({$sort: {last_name:1}}) : aggregateQuery.push({$sort: {last_name:-1}}) : null
    }
    console.log(aggregateQuery)
    if(args.last_name){
        aggregateQuery.push({
            $match: {last_name: new RegExp(args.last_name, "i") }
        },
        // {
        //     $sort: {last_name: 1}
        // }
        )
    }
    if(args.first_name){
        aggregateQuery.push({
            $match: {first_name:  new RegExp(args.first_name, "i") }
        },
        // {
        //     $sort: {first_name: 1}
        // }
        )
    }
    
            // if(aggregateQuery.length === 0){
            //     let result = await users.find()
            //     result.forEach((el)=>{
            //         el.id = mongoose.Types.ObjectId(el.id)
            //     })
            //     return {
            //         count: count,
            //         // page: 0,
            //         users: result
            //         };
            // }
            let result = await users.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el._id)
                        })
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
        const tick = Date.now()


    const userCheck = await users.findOne({email: args.email})
    if(!userCheck){
        return new ApolloError('FooError', {
            message: 'Email Not Found !'
          });
    }
    if(userCheck.status === 'deleted'){
        throw new ApolloError('FooError', 
        {message: "Can't Login, User Status: Deleted!"})
    }
    const getPassword = await bcrypt.compare(args.password, userCheck.password )
    if(!getPassword){
        throw new ApolloError('FooError', 
        {message: "Wrong password!"})
    }
    const token = jwt.sign({ email: args.email,},'zetta',{expiresIn:'6h'});
        console.log(`Total Time for Login: ${Date.now()- tick} ms`)
    return{message: token, user: { 
        email: userCheck.email, 
        fullName: userCheck.first_name + ' ' + userCheck.last_name, 
        first_name: userCheck.first_name, 
        last_name: userCheck.last_name,
        userType: userCheck.userType
    }}
}

// async function addCart(parent,args,context){
//     const tick = Date.now()
//     if(args.input.length == 0){
//         throw new ApolloError('FooError', {
//             message: "Input cannot be empty!"
//         })
//     }
//     // const transaction = {}
//     // transaction.user_id = context.req.payload
//     // transaction.menu = args.input
//     // const userActive = await users.findById(context.req.payload)
//     // // const newTransaction = await validateStockIngredient(context.req.payload, args.input)
//     // console.log(context.req.payload)
//     // userActive.cart = args.input
//     const newTransaction = await users.updateOne(
//         {_id: context.req.payload},
//         {$push: {cart: args.input}}
//         )
//     // findByIdAndUpdate(context.req.payload, {
//     //     cart: args.input
//     // },{
//     //     new: true
//     // })
//     // console.log(newTransaction.cart)
//     // await transactions.create(newTransaction)
//     // reduceIngredientStock(newTransaction)
//     console.log(`Total Time: ${Date.now()- tick} ms`)
//     return {
//         message: "Succesfully Added To Cart",
//         // cart: newTransaction.cart
//     }
// }



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
        // addCart
    }
}
module.exports = resolverUser;