const mongoose = require('mongoose');
const { users, transactions, recipes, ingredients, specialOffers } = require('../schema');
const { ApolloError } = require('apollo-errors');

async function createSpecialOffer(parent, { title, description, discountAmount, menuDiscount, status }, context, info) {
    try {
        if (menuDiscount.length == 0) {
            throw new ApolloError('FooError', {
                message: "Ingredient cannot be empty!"
            })
        }
        const specialOffer = {}
        specialOffer.title = title
        specialOffer.description = description
        specialOffer.menuDiscount = menuDiscount
        specialOffer.status = status
        let checkId = []
        let checkMenu = await recipes.find()
        checkMenu = checkMenu.map((el) => el.id)
        let menuMap = menuDiscount.map((el) => el.recipe_id)
        menuMap.forEach((el) => {
            if (checkMenu.indexOf(el) === -1) {
                throw new ApolloError("FooError", {
                    message: "Menu Not Found in Database!"
                })
            }
            checkId.push(el)
        })

        let checkStatusMenu = await recipes.find({
            _id: {
                $in: checkId
            }
        })
        for (menu of checkStatusMenu) {
            console.log(menu)
            if(menu.status === 'unpublished'){
                throw new ApolloError("FooError",{
                    message: "Menu You Insert is Unpublished!"
                })
            }
        }
        await recipes.updateMany({ _id: {
            $in: checkId
        }},{
            isDiscount: false,
            discountAmount: discountAmount
        },{new:true})
        const newSpecialOffer = await specialOffers.create(specialOffer)

        return newSpecialOffer
    }
    catch (err) {
        throw new ApolloError('FooError', err)
    }
}
async function getAllSpecialOffers(parent, args, context) {
    let count = await specialOffers.count({ status: { $ne: 'deleted' } });
    let aggregateQuery = [
        {
            $match: {
                status: { $ne: 'deleted' },
            }
        },
        { $sort: { _id: -1 } }
    ]
    if (args.title) {
        aggregateQuery.push({
            $match: { title: new RegExp(args.title, "i") }
        })
        count = await specialOffers.count({ title: new RegExp(args.title, "i") });
    }
    if (args.page) {
        aggregateQuery.push({
            $skip: (args.page - 1) * args.limit
        },
            { $limit: args.limit })
    }
    let result = await specialOffers.aggregate(aggregateQuery);
    result.forEach((el) => {
        el.id = mongoose.Types.ObjectId(el._id)
    })

    const max_page = Math.ceil(count / args.limit) || 1
    if (max_page < args.page) {
        throw new ApolloError('FooError', {
            message: 'Page is Empty!'
        });
    }
    return {
        count: count,
        max_page: max_page,
        page: args.page,
        data: result
    };
}
async function getOneSpecialOffer(parent,args,context){
    const getOne = await specialOffers.findById(args.id)
    if(!getOne){
        return new ApolloError("FooError",{
            message: "Wrong ID!"
        })
    }
    return getOne
}

async function updateSpecialOffer(parent,args,context){
    const specialOffer = await specialOffers.findByIdAndUpdate(args.id,{
        title: args.title,
        description: args.description,
        menuDiscount: args.menuDiscount,
        status: args.status
    },{
        new: true
    })
    let checkId = []
    specialOffer.menuDiscount.map((el) => {
        if(el.recipe_id.length < 10)throw new ApolloError('FooError',{
            message: 'Put Appropriate recipe_ID!'
        })
        checkId.push(el.recipe_id)
    } )
    if(args.status === "unpublished" || args.status === "deleted"){
        await recipes.updateMany(
            { _id: {
                $in: checkId
            }}
            ,{
            $set: {
                isDiscount: false,
                discountAmount:0
            }
        },{new : true}
        )
    }

    if(args.status === "active"){
        if(args.discountAmount){
        await recipes.updateMany(
            { _id: {
                $in:checkId
            }}
            ,{
            $set: {
                isDiscount: true,
                discountAmount: args.discountAmount
            }
        },{new : true}
        )
        }
        await recipes.updateMany(
            { _id: {$in:checkId}}
            ,{
            $set: {
                isDiscount: true,
            }
        },{new : true}
        )
    }
    if(specialOffer){
        console.log(`Update specialOffer: ${specialOffer.specialOffer_name}`)
        return specialOffer
        }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
        });
    }
const resolverSpecialOffer = {
    Query: {
        getAllSpecialOffers,
        getOneSpecialOffer
    },
    Mutation: {
        createSpecialOffer,
        updateSpecialOffer
    },
}
module.exports = resolverSpecialOffer