const book = {
    title : "Naruto",
    category : "Comics",
    author : "Masashi Kishimoto",
    price : 100000,
    onSale : true,
    discount : 10,
    stock : 10,
    wantToBuy : 13,
    tax :10,
    priceAfterDiscount : function(){
        if (this.onSale){
        return this.price - (this.price * (this.discount/100));
    }{return `Sorry, The Item is currently not on sale with the normal price after tax = ${this.priceAfterTax()}`;
}},
    priceAfterTax : function(){
        return this.price + (this.price * (this.tax/100));
    },
    finalPrice : function(){
        if (this.onSale){
            return this.priceAfterDiscount() + (this.priceAfterDiscount() * (this.tax/100));
            // book.totaltotprice = this.finalPrice();
        }{
            return this.priceAfterTax();
        }
    }
}
let creditFunction = (book, creditMonth) =>{
    const {price} = book
    
    let credit = Math.ceil(price /creditMonth)
    const monthlyPay = {}
    debt = credit * creditMonth
    monthlyPay.credit = credit
    monthlyPay.price = price
    monthlyPay.totalPriceCredit= 0;
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
    console.log(newArr)
    book.monthlyPay = newArr
}

let bookDetails = {
    title : book.title,
    category : book.category,
    author : book.author,
    discount : `${book.discount}%`,
    finalPrice : book.finalPrice()
}

let purchasedBook = 0
let amountPrice = 0;
let totalPrice = function(wantToBuy) {
    for(let i= 1; i <= wantToBuy; i++){
        if(book.stock){
            amountPrice += book.finalPrice();
            book.stock -= 1;
            purchasedBook = i

        }else{
            break;
        }
    }
    console.log(`The total price is:
    ${purchasedBook} x RP ${book.finalPrice()} = RP ${amountPrice}`)
    console.log(`Our available stock: ${book.stock}`)
    if(book.stock > 0){
        console.log(`You can still buy ${book.stock} of our book`)
    }else{
        console.log(`Im Sorry, but our book is out of stock`)
    }
}


console.log(bookDetails)
console.log(`The amount of discount is ${book.discount}%,
price after discount is RP ${book.priceAfterDiscount()},
The amount of tax is ${book.tax}%,
price after tax (without discount) is RP ${book.priceAfterTax()},
And the final price including discount and tax is RP ${book.finalPrice()}
`);
totalPrice(5)
console.log("===========================================")
creditFunction(book, 2);









// console.log(book);
// let person = {
//     name: 'John',
//     age:29
// }
// // let person2 = person
// let person2 = person

// person.age=31
// console.log(person2);

// testArr = [1,2,3]
// testArr.push(5)
// testArr.unshift(9)
// console.log(testArr)