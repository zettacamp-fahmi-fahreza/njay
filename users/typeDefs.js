const { ApolloServer,gql } = require('apollo-server');
// const {users,ingredients,recipes,transactionsSchema} = require('./schema');

const userTypeDefs = gql`#graphql
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
type respondDelUser {
    message: String
    data: User
    }
enum Enum {
    active
    deleted
    }
type login {
    message: String
    }
type Mutation {
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
}
type Query {
    getAllUsers(email:String,last_name: String,first_name:String,page: Int,limit: Int) : usersPage!
    getOneUser(email:String,id:ID): User!
}`

    module.exports = {userTypeDefs}