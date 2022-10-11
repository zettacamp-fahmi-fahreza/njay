const book = {
    title : "Naruto",
    category : "Comics",
    author : "Masashi Kishimoto",
    price : 100000,
    onSale : true,
    discount : 10,
    stock : 10,
    purchasedBook : 9,
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
        }{
            return this.priceAfterTax();
        }
    }
}


let bookDetails = {
    title : book.title,
    category : book.category,
    author : book.author,
    discount : `${book.discount}%`,
    finalPrice : book.finalPrice()
}
console.log(bookDetails)
console.log(`The amount of discount is ${book.discount}%,
price after discount is RP ${book.priceAfterDiscount()},
The amount of tax is ${book.tax}%,
price after tax (without discount) is RP ${book.priceAfterTax()},
And the final price including discount and tax is RP ${book.finalPrice()}
`);



