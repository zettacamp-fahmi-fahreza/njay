const express = require('express');
const mongoose = require('mongoose');
const {users} = require('./schema');
const { ApolloServer,gql } = require('apollo-server');
const{resolvers} = require('./resolver');
const {typeDefs} = require('./typeDefs');
const {makeExecutableSchema} = require('@graphql-tools/schema')
const {applyMiddleware} = require('graphql-middleware');
const authMiddleware = require('./auth')
const DataLoader = require('dataloader');
const ingredientLoader = require('./loader.js');




const app = express();

connectDB().catch((err) => console.log(err));
async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/warmindo");

}
    connectDB()

    const schema =  makeExecutableSchema({
        typeDefs,
        resolvers
    })
    const schemaMiddleware = applyMiddleware(
        schema,authMiddleware
    )
const server = new ApolloServer({
    schema: schemaMiddleware,
    context: function ({req}) {
      return {
          ingredientLoader,
          req 
      };}
  
  });



  server.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);