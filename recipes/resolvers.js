
const mongoose = require('mongoose');
const {recipes} = require('../schema');
const { ApolloError} = require('apollo-errors');



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
async function updateRecipe(parent,args,context){
    const recipe = await recipes.findByIdAndUpdate(args.id,args,{
        new: true
    })
    if(recipe){
        console.log(args.input);
        args.input.forEach((el) => {
            if(el.ingredient_id.length < 10)throw new ApolloError('FooError',{
                message: 'Put Appropriate Ingredient_ID!'
            })
        }) 
        return recipe
        }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
        });
    }

async function deleteRecipe(parent,args,context){
    const deleteRecipe = await recipes.findByIdAndUpdate(args.id,{
        status: 'deleted'
    }, {
        new : true
    })
    if(deleteRecipe){
    console.log(deleteRecipe);

        return {deleteRecipe, message: 'Recipe Has been deleted!', data: deleteRecipe}
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}
    // console.log(args.input.length);

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



const resolverRecipe = {
    Query: {
        
        getOneRecipe,
        getAllRecipes
    },
    Mutation: {
        deleteRecipe,
        updateRecipe,
        createRecipe
    },
    ingredientId: {
        ingredient_id: getIngredientLoader
    }
}
module.exports = resolverRecipe;