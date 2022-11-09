const { ApolloServer,gql } = require('apollo-server');

const {users,ingredients,recipes} = require('./schema');
const typeDefs = gql`#graphql
type User {
  id: ID
  password: String
  email: String
  last_name: String
  first_name: String
  status: Enum
}
type usersPage {
  count: Int
  page: Int
  users: [User]
}
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
type respondDelUser {
  message: String
  data: User
}
type respondDelIngredient {
  message: String
  data: Ingredient
}
enum Enum {
  active
  deleted
}
type login {
  message: String
}
type Mutation{
  addUser(
  password: String!
  email: String!
  last_name: String!
  first_name: String!
  ) : User!
  updateUser(
    id: ID!
    password: String
  email: String
  last_name: String
  first_name: String
  ): User!
  deleteUser(id: ID!): respondDelUser!
  getToken(email: String!, password:String!) : login!
  addIngredient(name: String!,stock: Int!): Ingredient!
  updateIngredient(id: ID!,stock: Int) : Ingredient!
  deleteIngredient(id: ID!) : respondDelIngredient!
  createRecipe(
    recipe_name: String!,input:[ingredientInput]
  ) : Recipe!
}

type Query {
getAllUsers(email:String,last_name: String,first_name:String,page: Int,limit: Int) : usersPage!
getOneUser(email:String,id:ID): User!
getOneIngredient(id:ID!): Ingredient!
getAllIngredient(name: String,stock: Int): ingredientsPage
getAllRecipes(recipe_name: String,page: Int,limit: Int): recipePage!
getOneRecipe(id:ID!): Recipe
}
`

module.exports = {typeDefs}