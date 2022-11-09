const mongoose = require('mongoose');
const {ingredients} = require('../schema');
const { ApolloError} = require('apollo-errors');

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
    // throw new ApolloError('FooError', {
    //     message: 'Wrong ID!'
    //   });
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
module.exports = resolverIngredient