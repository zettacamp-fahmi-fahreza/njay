const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const events = require("events");
const { resolve } = require("path");
const mongoose = require("mongoose");
const { comics, bookShelves } = require("./schema");
// const bookShelves = require('./schema')

const app = express();
const eventEmitter = new events.EventEmitter();

connectDB().catch((err) => console.log(err));

async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/test");
}
connectDB();

//SHOW ALL  BOOKSHELVES
app.get("/allBookShelves", async function (req, res, next) {
    const showBookShelves = await bookShelves.find().populate({
        path: "books",
        populate: {
            path: "book_id",
            select: "title author"
        }
    });
    res.send(showBookShelves);
});

//READ BOOKSHELVES BY ID
app.get("/bookShelves",express.urlencoded({ extended: true }),async function (req, res, next) {
        try{
            let { _id } = req.body;
            _id = mongoose.Types.ObjectId(_id)
            if (!_id ) {
                let err = new Error("ID is wrong or empty");
                res.send({
                    err: err.message,
                });
            } else {
                //SHOW BOOK AND CAN RECEIVE MORE THAN 1 ID'S
                // _id = _id.split(" ");
                // const filterByIDBookShelve = await bookShelves.find()
                // .elemMatch("books", { book_id: { $in: _id } }).populate({
                //     path: "books",
                //     populate: {
                //         path: "book_id",
                //         select: "title author"
                //     }
                // });

                const filterByIDBookShelve = await bookShelves.aggregate([
                    {$match: {"books.book_id" : _id}},
                    {$unwind:"$books" },
                    {$project:{_id: 0,date:0,createdAt:0,updatedAt:0,__v:0}}
                ])
            // const filterByIDBookShelve = await bookShelves.find({'books.book_id':{$all : _id}})
            // console.log(filterByIDBookShelve)
            res.send(filterByIDBookShelve);
            }
        }catch(err) {
            res.send(err)
        }
        
        
        
    }
);
// CREATE BOOKSHELVES
app.post("/bookShelves",express.urlencoded({ extended: true }),
    async function (req, res, next) {
        let { bookShelve } = req.body;
        const book_id = bookShelve.books.split(" ");
        const stock = bookShelve.stock.split(" ");
        bookArr = [];
        book_id.forEach((book,index) => {
            bookArr.push({
                book_id: book,
                stock: stock[index],
                added_date: new Date(),
            });
        });
        bookShelve.books = bookArr;
        bookShelve.date = new Date(bookShelve.date);
        const newBookShelve = new bookShelves(bookShelve);
        await newBookShelve.save();
        res.send(newBookShelve);
    }
);

// UPDATE BOOKSHELVES BY ID
// app.patch(
//   "/bookShelves",
//   express.urlencoded({ extended: true }),
//   async function (req, res, next) {
//     let { _id, date, new_date } = req.body;
//     // let {bookShelve} = req.body
//     let cek = "";
//     // bookShelve.books = bookShelve.books.split(' ')
//     if (!_id) {
//       let err = new Error("ID is wrong or empty");
//       res.send({
//         err: err.message,
//       });
//     } else {
//       cek = await bookShelves.updateOne(
//         { _id: mongoose.Types.ObjectId(_id) },
//         {
//           $set: {
//             "date.$[idx].date": new Date(new_date),
//           },
//         },
//         {
//           arrayFilters: [
//             {
//               "idx.date": {
//                 $lte: Date(date),
//               },
//             },
//           ],
//         }
//       );
//       console.log(cek);
//       //   const updatedBookShelf = await bookShelves.findById(_id);
//       //   res.send(updatedBookShelf);
//       res.send(cek);
//     }
//   }
// );
app.patch("/bookShelves",express.urlencoded({ extended: true }),
    async (req, res, next) => {
        try {
            let { id,key,date, updatedDate } = req.body;
            if (key === "shelf") {
                    const shelf = await bookShelves.updateOne(
                    {_id: mongoose.Types.ObjectId(id),},
                    {
                        $set: {
                            "date.$[index].date": new Date(updatedDate),
                            updatedAt: new Date(),
                        },
                    },{
                        arrayFilters: [
                            {
                                "index.date": {
                                    $gte: new Date(date),
                                },
                            },
                        ],
                    });const updatedBookShelf = await bookShelves.findById(id);
                res.send(updatedBookShelf);
            }

            if (key === "books") {
                const shelf = await bookShelves.updateOne(
                    {
                        _id: mongoose.Types.ObjectId(id),
                    },
                    {
                        $set: {
                            "books.$[index].added_date": new Date(updatedDate),
                            updatedAt: new Date(),
                        },
                    },
                    {
                        arrayFilters: [
                            {
                                "index.added_date": {
                                    $gte: new Date(date),
                                },
                            },
                        ],
                    });const updatedBookShelf = await bookShelves.findById(id);
                res.send(updatedBookShelf);
            }
        } catch (err) {
            next(err);
        }
    }
);

// DELETE BOOSHELF BY ID
app.delete(
    "/bookShelves",
    express.urlencoded({ extended: true }),
    async function (req, res, next) {
        const { _id } = req.body;
        if (!_id) {
            let err = new Error("ID is wrong or empty");
            res.send({
                err: err.message,
            });
        } else {
            const deleteBookShelve = await bookShelves.findByIdAndDelete(_id, {
                new: true,
            });
            res.send(
                `You have deleted:
            ${deleteBookShelve}`
            );
        }
    }
);

// SHOW BUKU
app.get("/allComics",express.urlencoded({ extended: true }), async function (req, res, next) {
    let {rating_star} = req.body
    rating_star = rating_star.split(",").map(Number)
    // let stockArr = [stock]

    const showBook = await comics.aggregate([
        {$addFields:{
            rating_star: rating_star
        }},
        {
            $addFields:{
                avg_rating : {$round:[{$avg:"$rating_star"},1]}
            }
        }
    ]);
    res.send(showBook);
});

app.get("/comics/:id", async function (req, res, next) {
    let { id } = req.params;
    let _id = mongoose.Types.ObjectId(id)
    // const showBook = await comics.findById(id);
    const showBook = await comics.aggregate([
        {$match: {_id : _id}},
        {$project:{title : 1, author : 1,_id:0, price : 1}},
    ])
    console.log(showBook)
    res.send(showBook);
});

// CREATE BOOK
app.post(
    "/comics",
    express.urlencoded({ extended: true }),
    async function (req, res, next) {
        const { book } = req.body;
        book.date_published = new Date(book.date_published);
        book.date_added = new Date();
        const saveBook = new comics(book);
        await saveBook.save();
        res.send(saveBook);
    }
);

app.patch(
    "/comics/:id",
    express.urlencoded({ extended: true }),
    async function (req, res, next) {
        const { id } = req.params;
        const { book } = req.body;
        if (!id) {
            let err = new Error("ID is wrong or empty");
            res.send({
                err: err.message,
            });
        } else {
            book.date_updated = new Date();
            const updateBook = await comics.findByIdAndUpdate(id, book, {
                new: true,
            });
            res.send(updateBook);
        }
    }
);

app.delete(
    "/comics/:id",
    express.urlencoded({ extended: true }),
    async function (req, res, next) {
        const { id } = req.params;
        if (!id) {
            let err = new Error("ID is wrong or empty");
            res.send({
                err: err.message,
            });
        } else {
            const deleteBook = await comics.findByIdAndDelete(id, { new: true });
            res.send(
                `You have deleted:
            ${deleteBook}`
            );
        }
    }
);

// Read File from local repo
const readFileEvent = async () => {
    file = await fs.readFile("./cisi.txt", "utf-8");
    console.log(file);
};
//Assign the event handler to an event:
eventEmitter.on("You", readFileEvent);

const book = {
    title: "Naruto",
    category: "comicss",
    author: "Masashi Kishimoto",
    price: 100000,
    onSale: true,
    discount: 10,
    stock: 10,
    wantToBuy: 13,
    tax: 10,
};
const mapBook = new Map();
const setBook = new Set();
app.post("/mapSet", express.urlencoded({ extended: true }), (req, res) => {
    const { title } = req.body;
    if (title) {
        if (setBook.has(title)) {
            let err = new Error(`${title} is already there`);
            throw err.message;
        } else {
            mapBook.set(title, { ...book, title });
            setBook.add(title);
            res.send(mapBook.get(title));
            // res.send([...mapBook.keys(title)]);
            // res.send([...mapBook.values(title)]);
        }
    } else {
        let err = new Error("Title is Empty");
        res.send({
            err: err.message,
        });
    }
});
app.get("/mapSet", (req, res) => {
    map = [...mapBook];
    console.log(map);
    res.send(map);
});
async function getBook() {
    let book1 = book;
    const time = 2000;
    return new Promise((resolve, rejects) => {
        setTimeout(() => {
            resolve(book1);
        }, time);
    });
}

let creditFunction = async (creditMonth, interests) => {
    const book = await getBook();
    const { price } = await book;
    let credit = Math.ceil(price / creditMonth + interests);
    const monthlyPay = {
        credit,
        price,
        interests,
        totalPriceCredit: 0,
    };
    debt = credit * creditMonth;
    monthlyPay.debt = debt;
    let newArr = [];
    for (let i = 0; i < creditMonth; i++) {
        monthlyPay.month = i + 1;
        monthlyPay.debt -= credit;
        monthlyPay.totalPriceCredit += credit;
        newArr.push({ ...monthlyPay });
    }
    newArr.map((e) => {
        e.scheme = `Scheme Credit ${e.month}`;
    });
    // console.log(newArr)
    book.monthlyPay = newArr;
};
bookList = [];
function addBook(book, amount) {
    for (let i = 0; i < amount; i++) {
        bookList.push(book);
    }
    return bookList;
}

// TANPILIN BUKU
app.get("/", authentication, function (req, res, next) {
    res.send(book);
});
// TAMBAHIN BUKU
app.get("/addBook/:bookAmount", authentication, function (req, res, next) {
    let bookAmount = req.params.bookAmount;
    bookAmount = parseInt(bookAmount);
    res.send(addBook(book, bookAmount));
});
//HARGA DISKON
app.get("/discount", authentication, function (req, res) {
    let discount = book.price - book.price * (book.discount / 100);
    book.discountprice = discount;
    res.json({
        book,
    });
});

//HARGA PAJAK
app.get("/tax", authentication, function (req, res) {
    let tax = book.price + book.price * (book.tax / 100);
    book.priceTax = tax;
    res.json({
        book,
    });
});

//HARGA FINAL
app.get("/finalPrice", authentication, function (req, res) {
    let discount = book.price - book.price * (book.discount / 100);
    let finalPrice = discount + discount * (book.tax / 100);
    book.finalPrice = finalPrice;
    res.json({
        book,
    });
});
// KREDIT BUKU
// app.get('/credit/:creditAmount', authentication, function(req, res) {
//     let {creditAmount} = req.params;
//     let err;
//     creditAmount = parseInt(creditAmount);
//     if (Number.isNaN(creditAmount)) {
//     err = new Error('Expected value of Integer');
//     res.send({
//         err : err.message
//     })
//     }else{
//     creditFunction(book , creditAmount);
//     res.send(book);
//     }
// })
// KREDIT BUKU BARU
app.get(
    "/creditNew/:creditAmount/:interests",
    authentication,
    async function (req, res) {
        let { creditAmount } = req.params;
        let { interests } = req.params;
        let err;
        creditAmount = parseInt(creditAmount);
        interests = parseInt(interests);
        if (Number.isNaN(creditAmount) && Number.isNaN(interests)) {
            err = new Error("Expected value of Integer");
            res.send({
                err: err.message,
            });
        } else {
            await creditFunction(creditAmount, interests);
            res.send(book);
        }
    }
);

// JUAL BUKU
app.get("/buyBook/:howMuch", authentication, function (req, res) {
    let { howMuch } = req.params;
    let purchasedBook = 0;
    let amountPrice = 0;
    let discount = book.price - book.price * (book.discount / 100);
    let finalPrice = discount + discount * (book.tax / 100);
    let totalPrice = function (wantToBuy) {
        for (let i = 1; i <= wantToBuy; i++) {
            if (book.stock) {
                amountPrice += finalPrice;
                book.stock -= 1;
                purchasedBook = i;
            } else {
                break;
            }
        }
    };
    let err;
    howMuch = parseInt(howMuch);
    if (Number.isNaN(howMuch)) {
        err = new Error("Expected value of Integer");
        res.send({
            err: err.message,
        });
    } else {
        totalPrice(howMuch);
        book.purchasedBook = purchasedBook;
        book.amountPrice = amountPrice;
        res.send(book);
    }
});

app.get("/event", authentication, (req, res) => {
    eventEmitter.emit("You");
    res.send("File Read Success!");
});
//ENDPOINT NO AWAIT
app.get("/noAwait", authentication, (req, res) => {
    fs.readFile("./cisi.txt", "utf-8")
        .then(function (result) {
            console.log(result);
            res.send("File Read Success!");
        })
        .catch(function (error) {
            console.log(error);
            res.send({
                error: error.message,
            });
        })
        .finally(function () {
            console.log("Ini Endpoint tanpa await \n");
        });
    console.log("GHALOWD NKJAEN ");
});

// ENDPOINT AWAIT
app.get("/withAwait", async (req, res) => {
    try {
        const data = await fs.readFile("./cisi.txt", "utf-8");
        console.log(data);
        console.log("This is Await \n");
        res.send("File Read Success!");
    } catch (err) {
        err = new Error("File Read Failed");
        res.setHeader("WWW-Authenticate", "Basic");
        err.status = 401;
        res.send({
            err: err.message,
        });
    }
});
// FUNGSI AUTENTIKASI
function authentication(req, res, next) {
    let authheader = req.headers.authorization;
    let err;
    if (!authheader) {
        err = new Error("You are not authenticated!");
        res.setHeader("WWW-Authenticate", "Basic");
        err.status = 401;
        res.send("There's Something Error");
    } else {
        let auth = new Buffer.from(authheader.split(" ")[1], "base64")
            .toString()
            .split(":");
        let user = auth[0];
        let pass = auth[1];

        if (user == "admin" && pass == "password") {
            next();
        } else {
            err = new Error("Wrong Username or Password!");
            res.send({
                err: err.message,
            });
        }
    }
}
// console.log(`The total price is:
// ${purchasedBook} x RP ${book.finalPrice()} = RP ${amountPrice}`)
// console.log(`Our available stock: ${book.stock}`)
// if(book.stock > 0){
//     console.log(`You can still buy ${book.stock} of our book`)
// }else{
//     console.log(`Im Sorry, but our book is out of stock`)
// }

// First step is the authentication of the client
app.use(authentication);
app.use(express.static(path.join(__dirname, "public")));

app.listen(4000);
