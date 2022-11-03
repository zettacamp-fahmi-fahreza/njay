const mongoose = require('mongoose');
const { comics, bookShelves } = require("./schema");

const resolvers = {
    Query: {
      book : async (parent,args)=>{
        if(args.id || args.author){
            // args.id = mongoose.Types.ObjectId(args.id)
                if(args.id ){
                    const books = await comics.find(
                    {_id: mongoose.Types.ObjectId(args.id)}
                    )
                    console.log(books)
                return books
                }else {
                    const books = await comics.find(
                    {author: args.author}
                    )
                    console.log(books)
                    return books
                }
        }else{
          const books= await comics.find({})
          console.log(books)
        return books
        }
        
      }
    },
    
  };
  module.exports = {resolvers}