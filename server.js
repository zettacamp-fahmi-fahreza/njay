
const express = require('express');
const { ApolloServer } = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
    # date_published: Date,
    price: Int
    id: ID!
    # date_added: Date,
    # date_updated: Date,
    # updated: Int,
  }
 type people{
    name : String!
    id: ID!
 }
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    peoples: [people]
    books: [Book]
  }
`;

const peoples = [
    {
        name: "Cisi Fahreza",
        id: 'abc123'
    },
    {
        name: "Fahmi Fahreza",
        id: '123abc'
    },
]

const books = [
    {
      title: 'The Awakening',
      author: 'Kate Chopin',
      price: '100000',
      id: "abc123"
    },
    {
      title: 'City of Glass',
      author: 'Paul Auster',
      price: '55000',
      id: "abc321"
    },
  ];
  // Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      books: () => books,
      peoples: () => peoples
    },
    
  };
  
  // The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  // const app = express();
// server.applyMiddleware({ app });

  // Passing an ApolloServer instance to the `startStandaloneServer` function:
  //  1. creates an Express app
  //  2. installs your ApolloServer instance as middleware
  //  3. prepares your app to handle incoming requests
server.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
