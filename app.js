const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const events = require('events');
const { resolve } = require('path');

const app = express();
const eventEmitter = new events.EventEmitter();





const book = {
    title : "Naruto",
    category : "Comics",
    author : "Masashi Kishimoto",
    price : 100000,
    onSale : true,
    discount : 10,
    stock : 10,
    wantToBuy : 13,
    tax :10
}

async function getBook() {
    let book1 = book
    const time = 2000
return new Promise((resolve, rejects)=>{
setTimeout(()=>{
resolve(book1)
}, time)
})
        
}

let creditFunction = async (creditMonth,interests) =>{
    const book = await getBook()
    const {price} = await book
    let credit = Math.ceil(((price /creditMonth)+ interests))
    const monthlyPay = {
        credit,
        price,
        interests,
        totalPriceCredit: 0
        }
    debt = credit * creditMonth
    monthlyPay.debt = debt
    let newArr = []
    for(let i = 0; i < creditMonth; i++) {
            monthlyPay.month = i +1;
            monthlyPay.debt -= credit 
            monthlyPay.totalPriceCredit += credit;
            newArr.push({...monthlyPay})
    }
    newArr.map((e)=>{
        e.scheme=`Scheme Credit ${ e.month}`;
    })
    // console.log(newArr)
    book.monthlyPay = newArr
}
bookList= [];
function addBook(book, amount) {
    for (let i = 0; i < amount; i++) {
        bookList.push(book);
        
    }
    return bookList;
}


// TANPILIN BUKU
 app.get('/',authentication, function(req, res, next) {
    res.send(book);
     })
// TAMBAHIN BUKU
app.get('/addBook/:bookAmount',authentication, function(req, res, next) {
    let bookAmount = req.params.bookAmount
    bookAmount = parseInt(bookAmount)
    res.send(addBook(book , bookAmount));
})
//HARGA DISKON
app.get('/discount',authentication, function(req, res) {
        let discount = book.price - (book.price * (book.discount/100))
        book.discountprice = discount
        res.json({
            book
            })
        })

//HARGA PAJAK
app.get('/tax',authentication, function(req, res) {
    let tax = book.price + (book.price * (book.tax/100));
    book.priceTax = tax
    res.json({
        book
        })
    })


//HARGA FINAL
app.get('/finalPrice',authentication, function(req, res) {
    let discount = book.price - (book.price * (book.discount/100))
    let finalPrice = discount + (discount * (book.tax/100));
    book.finalPrice = finalPrice
    res.json({
        book
        })
    })
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
app.get('/creditNew/:creditAmount/:interests', authentication, async function(req, res) {
    let {creditAmount} = req.params;
    let {interests} = req.params;
    let err;
    creditAmount = parseInt(creditAmount);
    interests = parseInt(interests);
    if (Number.isNaN(creditAmount) && Number.isNaN(interests)) {
    err = new Error('Expected value of Integer');
    res.send({
        err : err.message
    })
    }else{
    await creditFunction(creditAmount,interests);
    res.send(book);
    }
})

// JUAL BUKU
app.get('/buyBook/:howMuch', authentication, function(req, res) {
    let {howMuch} = req.params;
    let purchasedBook = 0
    let amountPrice = 0;
    let discount = book.price - (book.price * (book.discount/100))
    let finalPrice = discount + (discount * (book.tax/100));
    let totalPrice = function(wantToBuy) {
        for(let i= 1; i <= wantToBuy; i++){
            if(book.stock){
                amountPrice += finalPrice;
                book.stock -= 1;
                purchasedBook = i
            }else{
                break;
            }
        }}
    let err;
    howMuch = parseInt(howMuch);
    if (Number.isNaN(howMuch)) {
    err = new Error('Expected value of Integer');
    res.send({
        err : err.message
    })
    }else{
    totalPrice(howMuch)
    book.purchasedBook = purchasedBook;
    book.amountPrice = amountPrice;
    res.send(book );
    }
})
//ENDPOINT NO AWAIT
app.get('/noAwait',authentication,(req, res)=>{
    fs.readFile("./cisi.txt", "utf-8")
    .then(function(result) {
    console.log(result);
    res.send("File Read Success!")
    })
    .catch(function(error) {
    console.log(error);
    res.send({
        error: error.message
    })
    })
    .finally(function() {
    console.log("Ini Endpoint tanpa await \n")
})
console.log("GHALOWD NKJAEN ")})

// ENDPOINT AWAIT
app.get('/withAwait',async (req, res) =>{
    try {
        const data = await fs.readFile("./cisi.txt", "utf-8");
        console.log(data);
        console.log("This is Await \n")
        res.send("File Read Success!");
    }catch(err){
        err = new Error('File Read Failed');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        res.send({
            err : err.message
        });
    }
})
// FUNGSI AUTENTIKASI
function authentication(req, res, next) {
    let authheader = req.headers.authorization;
    let err;
    if (!authheader) {
         err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        res.send("Not authorized");
    }else{
        let auth = new Buffer.from(authheader.split(' ')[1],
        'base64').toString().split(':');
        let user = auth[0]
        let pass = auth[1];
     
        if (user == 'admin' && pass == 'password') {
            next();
        } else {
            err = new Error("Wrong Username or Password!");
            res.send({
                err : err.message
            }
                )
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
app.use(authentication)
app.use(express.static(path.join(__dirname, 'public')));
 


app.listen(4000);