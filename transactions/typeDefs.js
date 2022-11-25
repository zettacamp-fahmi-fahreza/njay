
const { ApolloServer,gql } = require('apollo-server');

const transactionTypeDefs = gql`#graphql
# scalar Date
type Menu {
        id: ID
        recipe_id: Recipe
        amount: Int
        note: String
    }
input transactionInput {
    user_id: ID
    menu: menuInput
}
input menuInput{
        recipe_id: ID
        amount: Int
        note: String
    }
type Transaction {
        id:ID
        user_id: User
        menu: [Menu]
        order_status: enumStatus
        order_date: String
        status: Enum
        totalPrice: Int
        onePrice: Int
        available: Int
        recipeStatus: enumRecipe
        # finalTotalPrice: Int
    }
    type transactionSort{
        order_date: enumSorting
    }
    input transactionSorting{
        order_date: enumSorting
    }

type transactionPage{
    count: Int
    page: Int
    data: [Transaction]
    max_page: Int
    finalTotalPrice: Int
    }
enum enumStatus {
        success
        failed
        pending
    }
enum enumUpdate {
    delete
    push
    pull
}

type Query {
    getOneTransaction(id:ID!) : Transaction!
    getAllTransactions(page: Int limit: Int last_name_user: String isCart: Boolean recipe_name:String order_status: String order_date: String sort: transactionSorting userFind:ID) : transactionPage!
}
type Mutation {
    createTransaction( input: menuInput) : Transaction
    checkoutTransaction: [Transaction]
    updateTransaction(id:ID! option: enumUpdate, note: String recipe_id: ID) : Transaction!
}
`


module.exports = {transactionTypeDefs}