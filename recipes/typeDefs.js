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
    enum Category {
        food
        drink
    }
    type Recipe {
    id: ID
    recipe_name: String
    ingredients:[ingredientId]
    price: Int
    status: Enum
    available: Int
    img: String
    description: String
    category: Category
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
    createRecipe(recipe_name: String! category: Category! img: String decription: String price: Int! input:[ingredientInput]!) : Recipe!
    updateRecipe(id:ID! recipe_name: String img: String description: String price: Int input:[ingredientInput]): Recipe!
    deleteRecipe(id: ID!): respondDelRecipe!
}`

module.exports = {recipeTypeDefs}