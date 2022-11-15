
const mongoose = require('mongoose');
const {recipes,ingredients} = require('../schema');
const { ApolloError} = require('apollo-errors');



async function getAllRecipes(parent,args,context,info) {
    let count = await recipes.count();
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
                return {
                count: count,
                page: args.page,
                data: result
                };
}

//ERRORR WANNA DEVELOP A FUNCTION WHERE INGREDIENT NOT FOUND BUT FAILED
async function createRecipe(parent,args,context,info){
    if(args.input.length == 0){
        throw new ApolloError('FooError', {
            message: "Ingredient cannot be empty!"
        })
    }
    const recipe= {}
    recipe.recipe_name = args.recipe_name
    recipe.ingredients = args.input
    let checkIngredient = await ingredients.find()
    checkIngredient = checkIngredient.map((el) => el.id)
    let ingredientMap = args.input.map((el) => el.ingredient_id)
    ingredientMap.forEach((el) => {
        if(checkIngredient.indexOf(el) === -1){
            throw new ApolloError("FooError",{
                message: "Ingredient Not Found in Database!"
            })
        }
    })
    const newRecipe = await recipes.create(recipe)
    return newRecipe
}
async function updateRecipe(parent,args,context){
    const recipe = await recipes.findByIdAndUpdate(args.id,args,{
        new: true
    })
    if(recipe){
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

        return {deleteRecipe, message: 'Recipe Has been deleted!', data: deleteRecipe}
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
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
async function getAvailable(parent, args, context, info) {
    const minStock = []
    // console.log(parent)
    for (let ingredient of parent.ingredients) {
        const recipe_ingredient = await ingredients.findById(ingredient.ingredient_id);
        if (!recipe_ingredient) throw new ApolloError(`Ingredient with ID: ${ingredient.ingredient_id} not found`, "404");
        minStock.push(Math.floor(recipe_ingredient.stock / ingredient.stock_used));
    }
    return Math.min(...minStock);
}


async function getIngredientLoader(parent, args, context){
    // console.log(parent);
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
    },
    Recipe: {
        available: getAvailable
    }
}
module.exports = resolverRecipe;