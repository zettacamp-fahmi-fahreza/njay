const { ApolloError ,gql} = require('apollo-server-express');
const mongoose = require('mongoose');
const { comics, bookShelves } = require("./schema");
const DataLoader = require('dataloader');
// const {keyBy} = require('lodash.keyby');

const {bookLoader} = require('./loader.js');


async function buyBook(parent,args){
    const book = await comics.findById(args.id)
    if(book.stock<args.purchasedBook){
        throw new ApolloError("Stock Not Enough")
    }else{
        book.stock -= args.purchasedBook
        if(args.discount){
                const priceDiscount = book.price - (book.price * (args.discount/100))

                if(args.tax){
                    const priceTax = priceDiscount + (priceDiscount *(args.tax/100))
                    await book.save()
                    return {
                        book,
                        purchasedBook:args.purchasedBook,
                        totalPrice: priceTax * args.purchasedBook
                    }
                }else{
                    await book.save()
                    return {
                        book,
                        purchasedBook:args.purchasedBook,
                        totalPrice: priceDiscount * args.purchasedBook
                    }
                }
    }else{
        await book.save()
                    return {
                        book,
                        purchasedBook:args.purchasedBook,
                        totalPrice: book.price * args.purchasedBook
                    }
    }
}
    
    
    
}
async function addBook(parent,args){
    const titleTaken = await comics.find(
        {title: args.title}
    )
        const newBook = new comics (args)
        await newBook.save()
        return newBook
        
   
}


async function updateBook(parent,args){
        const updateBook = await comics.findByIdAndUpdate(args.id, args,{
            new: true
        })
        return updateBook
}

async function deleteBook(parent,args){
    const deleteBook = await comics.findByIdAndDelete(args.id,{
        new: true
    })
    return {message: "U SUcceed!",data: deleteBook}
}

async function priceAfterDiscount(parent,args){
    args.id = mongoose.Types.ObjectId(args.id)
    const findBook = await comics.findById(args.id)
    if(findBook){
        price = findBook.price
        totalPrice = parseInt (price - (price * (args.discount/100)))
        findBook.totalPrice = totalPrice
        return {book:findBook,totalPrice}
    }
}

async function priceAfterTax(parent,args){
    args.id = mongoose.Types.ObjectId(args.id)
    const findBook = await comics.findById(args.id)
    if(findBook){
        price = findBook.price
        totalPrice =  price + (price * (args.tax/100))
        findBook.totalPrice = totalPrice
        return {book:findBook,totalPrice}
    }
}


async function getPagination(parent,args){
    let count = await comics.count();
    // if(args.page -1 <= 1){
    //     args.page = 0
    // }
    let result = await comics.aggregate([
    {$project: {id: 1, title: 1, author: 1, date_published: 1, price: 1}
    },
    {$skip: (args.page-1 )*args.limit},
    {$limit: args.limit}
]);
result = result.map((el) => {
    el.id = mongoose.Types.ObjectId(el._id)
    return el
    })
    return {
        count: count,
        page: args.page,
        page_max: Math.ceil( count / args.limit),
        books: result
        };
}
// async function getAllBookShelve(parent,args){
//     const loaderBook = new DataLoader((keys)=> {
//         console.log("tes")
//         const result = keys.map((el) => {
//             return comics.find({
//                 _id: {
//                     $in: el._id
//                 }
//             })
//             return Promise.resolve(result)
//         })
//         console.log(result)
//         // return loaderBook.load(parent.books)
//         return Promise.resolve(result)
//     })
//     }

 const getBookShelf = async function (){
    const getBookShelf = await bookShelves.find()
    
    return getBookShelf
}

// const bookLoader = new DataLoader(getBookShelf)

// const getAllBookShelves =async()=>{
//     await bookShelves.find()
//     return { loaderBook}
// }

// async function batchBook(bookIds){
//     const books = await comics.find({
//         _id: {
//             $in : bookIds
//         }
//     })
//     const bookByIds = keyBy(books, '_id')
//     return bookIds.map(bookIds => bookByIds[bookIds])
// }
// const bookLoader = () => {
//     return new DataLoader(bookIds => batchBook(bookIds))
// }

 async function book_id(parent,args,context){
    // console.log("zzz")
    if(parent.book_id){
        // console.log(parent)
console.log(context)
        return await context.bookLoader.load(parent.book_id)
        
    }
}

const resolvers = {
    Mutation:{
        addBook,
        updateBook,
        deleteBook,
        priceAfterDiscount,
        priceAfterTax,
        buyBook
    },
    Query: {
      book : async (parent,args)=>{
        if(args.id || args.author){
                if(args.id ){
                    const books = await comics.findById(
                    {_id: mongoose.Types.ObjectId(args.id)}
                    )
                    return books
                }else if(args.author) {
                    const books = await comics.findOne(
                    {author: args.author}
                    )
                    return books
                }
        }else{
          const books= await comics.find()
            return books
        }
        
      },
      getPagination,
    //   bookLoader,    
      getBookShelf
   
    },
    booksForBookShelves: {
        book_id
    }
    
  };
  module.exports = {resolvers}