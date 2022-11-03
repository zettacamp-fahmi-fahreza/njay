const { comics, bookShelves } = require("./schema");

const typeDefs = `#graphql
type Book {
  title: String
  author: String
  date_published: String,
  price: Int
  id: ID
  date_added: String,
  date_updated: String,
}
type Query {
  book(id: ID,author:String): [Book]
}
`;
module.exports = {typeDefs}