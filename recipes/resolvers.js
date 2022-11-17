
const mongoose = require('mongoose');
const {recipes,ingredients} = require('../schema');
const { ApolloError} = require('apollo-errors');



async function getActiveMenu(parent,args,context,info) {
    let count = await recipes.count();
    let aggregateQuery = [
        
            {$match: {
                status: 'active'
            }}
        
    ]
    if(args.recipe_name){
        aggregateQuery.push({
            $match: {recipe_name: new RegExp(args.recipe_name, "i")}
        })
    }
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
    }
    if(args.input){
        args.input.recipe_name === 'asc' ? aggregateQuery.push({$sort: {recipe_name:1}}) : aggregateQuery.push({$sort: {recipe_name:-1}})
    }
    // if(aggregateQuery.length === 0){
    //     let result = await recipes.find()
    //     result.forEach((el)=>{
    //         el.id = mongoose.Types.ObjectId(el._id)
    //     })
    //     return {
    //         count: count,
    //         // page: 0,
    //         data: result
    //         };
    // }
    let result = await recipes.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el._id)
                        })
                    console.log(`Aggregate Apply for getActiveMenu: ${aggregateQuery}`)
                console.log(count)
                return {
                page: args.page,
                count: count,
                max_page: Math.ceil(count/args.limit),
                data: result
                };
}

async function getAllRecipes(parent,args,context,info) {
    let count = await recipes.count();
    let aggregateQuery = []
    if(args.recipe_name){
        aggregateQuery.push({
            $match: {recipe_name: new RegExp(args.recipe_name, "i")}
        })
    }
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
    }
    if(args.input){
        args.input.recipe_name === 'asc' ? aggregateQuery.push({$sort: {recipe_name:1}}) : aggregateQuery.push({$sort: {recipe_name:-1}})
    }
    if(aggregateQuery.length === 0){
        let result = await recipes.find()
        result.forEach((el)=>{
            el.id = mongoose.Types.ObjectId(el._id)
        })
        console.log(`No Aggregate Apply for getAKkRecipes: ${result[1].recipe_name}`)
        
        return {
            count: count,
            // page: 0,
            data: result
            };
    }
    let result = await recipes.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el._id)
                            // el.recipe_name = args.recipe_name
                        console.log(el)
                        
                        })
                        console.log(aggregateQuery)
                        count = result.length;
                        
                return {
                count: count,
                page: args.page,
                max_page: Math.ceil(count/args.limit),

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
    recipe.description = args.description
    recipe.price = args.price
    recipe.img = args.img
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
    console.log(`Create Recipe: ${newRecipe}`)

    return newRecipe
}
async function updateRecipe(parent,args,context){
    const recipe = await recipes.findByIdAndUpdate(args.id,{
        recipe_name: args.recipe_name,
        description: args.description,
        price: args.price,
        img: args.img,
        status: args.status,
        ingredients: args.input
    },{
        new: true
    })
    if(recipe){
        args.input.forEach((el) => {
            if(el.ingredient_id.length < 10)throw new ApolloError('FooError',{
                message: 'Put Appropriate Ingredient_ID!'
            })
        }) 
        console.log(`Update Recipe: ${recipe.recipe_name}`)
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
    for (let ingredient of parent.ingredients) {
        const recipe_ingredient = await ingredients.findById(ingredient.ingredient_id);
        if (!recipe_ingredient) throw new ApolloError(`Ingredient with ID: ${ingredient.ingredient_id} not found`, "404");
        minStock.push(Math.floor(recipe_ingredient.stock / ingredient.stock_used));
    }
    return Math.min(...minStock);
}
async function isUsed(parent, args, context) {
    const ingredients = []
    console.log(parent)
    return true
    // await ingredients.find({
    //     ingredient_id: {
    //         $in: parent.ingredients.map((el) => el.ingredient_id)
    //     }
    // })
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
        getActiveMenu,
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
    },

}
module.exports = resolverRecipe;