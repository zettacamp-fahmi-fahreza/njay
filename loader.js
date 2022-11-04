const DataLoader = require('dataloader');
// import song model
const comics  = require("./schema");

const getBookShelf = async function (bookIds){
    // console.log("Cuma Masuk Disini")
    const bookLists = await comics.find({
        _id: {
            $in: bookIds
        }
    });
    console.log(bookLists)
    const bookMap = {};
    bookLists.forEach((book) => {
        bookMap[book._id] = book
    })
    return bookIds.map(id => bookMap[id])
    // return bookIds.map(bookId => bookLists[bookId] || new Error('No Result'))
}

const bookLoader = new DataLoader(getBookShelf)
// console.log(bookLoader);

module.exports = bookLoader
// module.exports = {
//     loaders: () => {
//       return {
//         bookLoader: bookLoader()
//     }
// }
// }