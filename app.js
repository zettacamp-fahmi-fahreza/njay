const express = require('express');
const mongoose = require('mongoose');
const {users} = require('./schema');
const { ApolloServer,gql } = require('apollo-server');
const{resolvers} = require('./resolver');
const {typeDefs} = require('./typeDefs');


const app = express();

connectDB().catch((err) => console.log(err));
async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/warmindo");

}
    connectDB()





const server = new ApolloServer({
    typeDefs,
    resolvers
    // context: function ({req}) {
    //   return {
    //     //   songLoader,
    //       req : req
    //   };}
  
  });



  server.listen({ port: 3000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);