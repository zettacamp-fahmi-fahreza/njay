const { ApolloServer,gql } = require('apollo-server');

const {users,ingredients} = require('./schema');

const typeDefs = gql`#graphql
type User {
  id: ID
  password: String
  email: String
  last_name: String
  first_name: String
  status: String
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
  status: String
}
type ingredientsPage{
  count: Int
  page: Int
  data: [Ingredient]
}
type respondDelUser {
  message: String
  data: User
}
type respondDelIngredient {
  message: String
  data: Ingredient
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
}

type Query {
getAllUsers(email:String,last_name: String,first_name:String,page: Int,limit: Int) : usersPage!
getOneUser(email:String,id:ID): User!
getOneIngredient(id:ID!): Ingredient!
getAllIngredient(name: String,stock: Int): ingredientsPage
}
`

module.exports = {typeDefs}