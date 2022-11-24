const mongoose = require('mongoose');
const {users} = require('../schema');
const { ApolloError} = require('apollo-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

async function addUser(parent,args, context, info){
    args.password = await bcrypt.hash(args.password, 5)
    
    const newUser = new users(args)
    await newUser.save()
    return newUser;
}

async function getAllUsers(parent,{email,last_name,first_name,page,limit,sort}, context){
    let count = await users.count({status: 'active'});
    let aggregateQuery = [
        {$match: {
            status: 'active'
        }},
        {$sort: {_id:-1}}

    ]
    if (page){
        aggregateQuery.push({
            $skip: (page - 1)*limit
        },
        {$limit: limit})
        
    }
    if(email){
        aggregateQuery.push({
            $match: {email: email}
        },
        )
        count = await recipes.count({recipe_name: new RegExp(recipe_name, "i")});
    }
    if(sort){
        sort.email ? sort.email === 'asc' ? aggregateQuery.push({$sort: {email:1}}) : aggregateQuery.push({$sort: {email:-1}}): null
        sort.first_name ? sort.first_name === 'asc' ? aggregateQuery.push({$sort: {first_name:1}}) : aggregateQuery.push({$sort: {first_name:-1}}) : null
        sort.last_name ? sort.last_name === 'asc' ? aggregateQuery.push({$sort: {last_name:1}}) : aggregateQuery.push({$sort: {last_name:-1}}) : null
    }
    console.log(aggregateQuery)
    if(last_name){
        aggregateQuery.push({
            $match: {last_name: new RegExp(last_name, "i") }
        },
        )
    }
    if(first_name){
        aggregateQuery.push({
            $match: {first_name:  new RegExp(first_name, "i") }
        },
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
                    console.log(`total time: ${Date.now()- tick} ms`)
                    if(!page){
                        count = result.length
                    }
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
        userType: userCheck.userType,
        role: userCheck.role
    }}
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
        // addCart
    }
}
module.exports = resolverUser;