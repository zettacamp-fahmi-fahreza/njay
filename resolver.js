const { ApolloServer,gql } = require('apollo-server');
const mongoose = require('mongoose');
const DataLoader = require('dataloader');
const {users} = require('./schema');
const { ApolloError} = require('apollo-errors');
const { constants } = require('picomatch');
const jwt = require('jsonwebtoken');
const { message } = require('statuses');


async function addUser(parent,args, context, info){
    const newUser = new users(args)
    // await newUser.save()
    return newUser;
}
async function getAllUsers(parent,args, context){
    const getAll = await users.find()
    return getAll
}

const resolvers = {
    Query: {
        getAllUsers
    },
    Mutation: {
        addUser
    }
}
module.exports = resolvers