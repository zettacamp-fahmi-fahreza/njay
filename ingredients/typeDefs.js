const { ApolloServer,gql } = require('apollo-server');
const {users,ingredients,recipes,transactionsSchema} = require('../schema');

const ingredientTypeDefs = gql`#graphql
type Ingredient{
    id: ID
    name: String
    stock: Int
    status: Enum
    }
type ingredientsPage{
    count: Int
    page: Int
    data: [Ingredient]
    }
type respondDelIngredient {
    message: String
    data: Ingredient
    }
type Mutation{
    addIngredient(name: String!,stock: Int!): Ingredient!
    updateIngredient(id: ID!,stock: Int) : Ingredient!
    deleteIngredient(id: ID!) : respondDelIngredient!
    }
type Query {
    getOneIngredient(id:ID!): Ingredient!
    getAllIngredient(name: String,stock: Int): ingredientsPage
    }`

module.exports = {ingredientTypeDefs}