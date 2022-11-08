const { ApolloServer,gql } = require('apollo-server');

const {users} = require('./schema');

const typeDefs = gql`#graphql
type User {
  id: ID
  password: String
  email: String
  last_name: String
  first_name: String
  status: String
}
type Mutation{
  addUser(
  password: String!
  email: String!
  last_name: String!
  first_name: String!
  ) : User!
}

type Query {
getAllUsers : [User]
}
`

module.exports = {typeDefs}