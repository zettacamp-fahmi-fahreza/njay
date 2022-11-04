const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server');
const{resolvers} = require('./resolver');
const {typeDefs} = require('./typeDefs');
// const { v4: uuidv4 } = require('uuid');


connectDB().catch((err) => console.log(err));

async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/test");
}
connectDB();

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

server.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
