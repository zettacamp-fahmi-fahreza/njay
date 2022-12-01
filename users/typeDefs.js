const { ApolloServer,gql } = require('apollo-server');

const userTypeDefs = gql`#graphql
type User {
    id: ID
    img: String
    password: String
    email: String
    last_name: String
    first_name: String
    status: Enum
    userType: userType
    role: Role
    # cart: [Menu]
    sort: userSort
    fullName: String
    isUsed: Boolean
    }
    type userSort {
        email: enumSorting
        last_name: enumSorting
        first_name: enumSorting
    }

    input userSorting {
        email: enumSorting
        last_name: enumSorting
        first_name: enumSorting
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
    data: [User]
    max_page: Int
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
enum enumSorting {
    asc
    desc
}
type userLogin {
    email: String
    fullName: String
    first_name: String
    last_name: String
    userType: userType
    role: Role
    isUsed: Boolean
    img: String
    
}
type respondAddCart {
    message: String
}
type login {
    message: String
    user: userLogin
    }
type Mutation {
    addUser(
    img: String
    password: String!
    email: String!
    last_name: String!
    first_name: String!
    role: Role!
    ) : User!
    updateUser(
        id: ID
        # password: String
    email: String
    last_name: String
    first_name: String
    status: Enum
    isUsed: Boolean
    
    ): User
    deleteUser(id: ID!): respondDelUser!
    getToken(email: String!, password:String!) : login!
    logout(isUsed: Boolean): User
    # addCart( input: [menuInput]) : respondAddCart!
}
type Query {
    getAllUsers(email:String,last_name: String,first_name:String,page: Int,limit: Int sort:userSorting ) : usersPage!
    getOneUser(email:String,id:ID): User!
}`

    module.exports = {userTypeDefs}