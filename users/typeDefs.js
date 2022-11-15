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
    userType: userType
    role: Role
    }
    type userType {
        userType_permission: [userType_permit]
    }
    type userType_permit{
        name: String
        view: Boolean
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
    enum Role{
        admin
        user
    }
enum Enum {
    active
    deleted
    }
type userLogin {
    email: String
    fullName: String
    first_name: String
    last_name: String
    userType: userType
    
}
type login {
    message: String
    user: userLogin
    }
type Mutation {
    addUser(
    password: String!
    email: String!
    last_name: String!
    first_name: String!
    role: Role!
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