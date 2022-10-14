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
    
}
finalPrice = function(){
    if (book.onSale){
        return book.priceAfterDiscount() + (book.priceAfterDiscount() * (book.tax/100));
        // book.totaltotprice = book.finalPrice();
    }{
        return book.priceAfterTax();
    }
}
priceAfterTax = function(){
    return book.price + (book.price * (book.tax/100));
}
priceAfterDiscount = function(){
    if (book.onSale){
    return book.price - (book.price * (book.discount/100));
}{return `Sorry, The Item is currently not on sale with the normal price after tax = ${book.priceAfterTax()}`;
}}

let creditFunction = (book, creditMonth) =>{
    const {price,author,category} = book

    let credit = Math.ceil(price /creditMonth)
    const monthlyPay = {
        credit,
        price,
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
    console.log(newArr)
    console.log(author)
    console.log(category)
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
price after discount is RP ${priceAfterDiscount()},
The amount of tax is ${book.tax}%,
price after tax (without discount) is RP ${priceAfterTax()},
And the final price including discount and tax is RP ${finalPrice()}
`);
totalPrice(5)
console.log("===========================================")
creditFunction(book, 5);









// console.log(book);
let person = {
    name: 'John',
    age:29
}
// let person2 = person
let person2 = {...person}

person.age=31
console.log(person2);
console.log(person)

// testArr = [1,2,3]
// testArr.push(5)
// testArr.unshift(9)
// console.log(testArr)