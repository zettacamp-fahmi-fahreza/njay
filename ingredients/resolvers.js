const mongoose = require('mongoose');
const {ingredients, recipes} = require('../schema');
const { ApolloError} = require('apollo-errors');

async function getAllIngredient(parent,{name,stock,page,limit,sort},context){
    const tick = Date.now()
    let count = await ingredients.count({status: 'active'});
    let aggregateQuery = [
            {$match: {
                status: 'active'
            }},
            {$sort: {_id:-1}}
        
    ]
    if(name){
        aggregateQuery.push({
            $match: {name: new RegExp(name, "i")}
        },{
            $sort: {name: 1}
        })
        count = await ingredients.count({name: new RegExp(name, "i")});
    }

    if(stock && stock>0){
        aggregateQuery.push({
            $match: {stock: {$gte :stock}}
        },{
            $sort: {stock: 1}
        })
    }
    if(stock <= 0){
        throw new ApolloError('FooError', {
            message: 'Stock Cannot be 0!'
          });
    }
    if (page){
        aggregateQuery.push({
            $skip: (page - 1)*limit
        },
        {$limit: limit})
    }
    if(sort){
    if(sort.name){
        sort.name === 'asc' ? aggregateQuery.push({$sort: {name:1}}) : aggregateQuery.push({$sort: {name:-1}})
    }
    if(sort.stock){
        sort.stock === 'asc' ? aggregateQuery.push({$sort: {stock:1}}) : aggregateQuery.push({$sort: {stock:-1}})
    }
}
    // if(!aggregateQuery.length){
    //     let result = await ingredients.find({
    //         // status: 'active'
    //     })
    //     result.forEach((el)=>{
    //         el.id = mongoose.Types.ObjectId(el._id)
    //     })
    //     // console.log(`total time: ${Date.now()- tick} ms`)
    //     return {
    //         count: count,
    //         // page: 0,
    //         data: result
    //         };
    // }
    let result = await ingredients.aggregate(aggregateQuery);
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

// ERRORR ADD REGEX HERE TO AVOID DUPICATION
async function addIngredient(parent,args,context){
    const findDuplicate = await ingredients.findOne({
        name:  new RegExp("^" + args.name.trim("") + "$", 'i')

    })
    if(findDuplicate){
        throw new ApolloError('FooError', {
            message: 'Ingredient Already Exists!'
        })
    }
    const newIngredient = new ingredients(args)
    await newIngredient.save()
    return newIngredient;
}
async function getOneIngredient(parent,args,context){
    const getOneIngredient = await ingredients.findById(args.id)
    return getOneIngredient
}
async function updateIngredient(parent,args,context){
    console.log(typeof(args.id))
    if(args.stock < 0){
        throw new ApolloError('FooError', {
            message: 'Stock Cannot be less than 0!'
          });
    }
    const updateIngredient = await ingredients.findByIdAndUpdate(args.id, args,{
        new: true
    })
    if(updateIngredient){
        return updateIngredient
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}
// async function deleteIngredient(parent,args,context) {
//     const allRecipes = await recipes.find()
//     for(let recipe of allRecipes){
//         for(let ingredient of recipe.ingredients){
//             let ingredient_id = ingredient.ingredient_id.toString()
//             if(ingredient_id === args.id){
//                 throw new ApolloError('FooError', {
//                     message: 'Cannot delete this ingredient!'
//                   });
//         }
//     }
//     }
//     const deleteIngredient = await ingredients.findByIdAndUpdate(args.id,{
//         status: 'deleted',
//         stock: 0
//     }, {
//         new : true
//     })
//     if(deleteIngredient){
//         return {deleteIngredient, message: 'Ingredient Has been deleted!', data: deleteIngredient}
//     }
//     throw new ApolloError('FooError', {
//         message: 'Wrong ID!'
//       });
// 
// }

async function findIngredientInRecipe(id) {
    const checkRecipe = await recipes.find({ ingredients: { $elemMatch: { ingredient_id: mongoose.Types.ObjectId(id) } } })
    if (!checkRecipe.length) return true
    return false;
}
async function deleteIngredient(parent,args,context) {
    console.log(args.id)
    const checkIngredient = await findIngredientInRecipe(args.id)
    if (!checkIngredient){
        throw new ApolloError('FooError', {
            message: 'Ingredient is used in recipe, Cannot Delete!'
          });
    }
    const deleteIngredient = await ingredients.findByIdAndUpdate(args.id,{
        status: 'deleted',
        stock: 0
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