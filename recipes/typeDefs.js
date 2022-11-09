const { ApolloServer,gql } = require('apollo-server');
const {users,ingredients,recipes,transactionsSchema} = require('../schema');

const recipeTypeDefs = gql`

    type ingredientId{
    ingredient_id: Ingredient
    stock_used: Int
    }
    input ingredientInput{
    ingredient_id: ID
    stock_used: Int
    }
    type recipePage{
    count: Int
    page: Int
    data: [Recipe]
    }
    type Recipe {
    id: ID
    recipe_name: String
    ingredients:[ingredientId]
    status: Enum
    }
    type respondDelRecipe{
    message: String
    data: Recipe
    }

type Query {
    getAllRecipes(recipe_name: String,page: Int,limit: Int): recipePage!
    getOneRecipe(id:ID!): Recipe
}
type Mutation {
    createRecipe(recipe_name: String! input:[ingredientInput]!) : Recipe!
    updateRecipe(id:ID! recipe_name: String input:[ingredientInput]): Recipe!
    deleteRecipe(id: ID!): respondDelRecipe!
}`

module.exports = {recipeTypeDefs}