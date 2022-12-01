const DataLoader = require('dataloader');
const { log } = require('loglevel');
const {users,ingredients,recipes,transactions} = require('../schema');

const loadIngredient = async function(checkId){
    let ingredientList = await ingredients.find({
        _id: {
            $in: checkId
        }
    })
    let ingredientMap = {}

    ingredientList.forEach((ingredient)=> ingredientMap[ingredient._id] = ingredient)
    return checkId.map(id => ingredientMap[id])
}




const ingredientLoader = new DataLoader(loadIngredient)
module.exports = ingredientLoader;