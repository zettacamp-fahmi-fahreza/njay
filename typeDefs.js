const { comics, bookShelves } = require("./schema");
const { v4: uuidv4 } = require('uuid');


const typeDefs = `#graphql
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
type bookPurchase {
  book: Book
  discount: Int
  tax: Int
  purchasedBook: Int
  totalPrice: Int
}
type pageBook{
  books: [Book],
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
  book(id: ID,author:String): Book,
  getPagination(limit:Int,page:Int): pageBook
}
`;
module.exports = {typeDefs}