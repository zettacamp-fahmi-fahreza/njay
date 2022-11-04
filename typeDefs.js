const { comics, bookShelves } = require("./schema");
// const { v4: uuidv4 } = require('uuid');

const { ApolloServer,gql } = require('apollo-server');


const typeDefs = gql`#graphql

type Book {
  title: String
  author: String
  date_published: String,
  price: Int
  id: ID
  date_added: String,
  date_updated: String,
  stock: Int
}
type booksForBookShelves{
                book_id: Book
                added_date: String
                stock: Int
}
type date{
  date: String
  time: Int
}
type bookShelve {
        name: String
        books: [booksForBookShelves]
        date: date
        
}
type bookPurchase {
  book: Book
  discount: Int
  tax: Int
  purchasedBook: Int
  totalPrice: Int
}
type pageBook{
  books: [Book]
  count: Int
  page: Int
  page_max: Int
}
type respondDel{
  message: String,
  data: Book
}

type Mutation{
    addBook (
        title: String!,
        author: String!
        date_published: String!,
        price: Int!
        stock: Int!
        date_added: String!,
        date_updated: String!,
        ): Book!,


    updateBook(
        title: String,
        author: String
        date_published: String,
        price: Int
        stock: Int
        date_added: String,
        date_updated: String,
        id: ID!
    ): Book,

    buyBook(
      id: ID!,
      purchasedBook: Int!,
      tax: Int
      discount: Int
    ): bookPurchase

 
    deleteBook(
        id: ID!
        ): respondDel,


    priceAfterDiscount(
      id: ID!,
      discount: Int!
    ): bookPurchase,

    priceAfterTax(
      id: ID!,
      tax: Int!
    ): bookPurchase
}
type Query {
  # getAllBookShelve : [bookShelve]
  # bookLoader: [booksForBookShelves]
  getBookShelf: [bookShelve]
  book(id: ID,author:String): Book,
  getPagination(limit:Int,page:Int): pageBook,
  
}`; 
module.exports = {typeDefs}