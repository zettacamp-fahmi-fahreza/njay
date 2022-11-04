const mongoose = require('mongoose');
const { ApolloServer,gql } = require('apollo-server');
const{resolvers} = require('./resolver');
const {typeDefs} = require('./typeDefs');
const DataLoader = require('dataloader');
const {bookLoader} = require('./loader.js');
const { makeExecutableSchema } = require('@graphql-tools/schema')




connectDB().catch((err) => console.log(err));

async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/test");
}
connectDB();



const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: function ({}) {
      return {
          bookLoader
      };}
    // context: () => ({
    //   loaders: loaders(),
    // }),
  
  });

//   server.start().then(res => {
//     server.applyMiddleware({
//         app
//     });
//     // run port 
//     app.listen(port, () => {
//         console.log(`App running in port ${port}`);
//     });
// });

server.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
