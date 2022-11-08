
const { ApolloServer,gql } = require('apollo-server');
const mongoose = require('mongoose');
const DataLoader = require('dataloader');
const {songs,songPlaylist} = require('./schema');
const { ApolloError} = require('apollo-errors');
const { constants } = require('picomatch');
const jwt = require('jsonwebtoken');
const { message } = require('statuses');

// Add Pagination in getAllSongs later

// async function getAllSongs(){
//     const getAllSongs =await songs.find().lean()
//     getAllSongs.forEach((el)=>{
//         el.released = el.released.toLocaleString('default', {
//             year: 'numeric',
//             month: 'long',
//             day: '2-digit'
//         })
//         el.id = mongoose.Types.ObjectId(el.id)
//     })
//     console.log(typeof (getAllSongs))
//     return getAllSongs;
// }
async function getToken(parent,args){
const username = 'foobar';
const password = 'secret';
    const token = jwt.sign({
        data: username,
      }, password, { expiresIn: '1h' });
      if(args.username === username && args.password === password){
        return{
            message: token
          }
      }else{
        return new ApolloError('FooError', {
            message: 'Invalid user or password!'
          });
        }
}
async function getAllSongs(parent, {page, limit},context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    
    let count = await songs.count();
    if (page){
        let result = await songs.aggregate([
            {
            $project: {
            id: 1, title: 1, artist: 1, genre: 1,duration:1,released:1
            }
            },{
            $skip: (page-1)*limit
            },{
            $limit: limit
            }
            
            ]);
            result.forEach((el)=>{
                        el.released = el.released.toLocaleString('default', {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit'
                        })
                        el.id = mongoose.Types.ObjectId(el.id)
                    })
            
            return {
            count: count,
            page: page,
            page_max: Math.ceil( count/limit),
            songs: result
            };
    }else{
let result = await songs.find()
result.forEach((el)=>{
    el.released = el.released.toLocaleString('default', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    })
    el.id = mongoose.Types.ObjectId(el.id)
})
        return {
            count : count,
            page : 0,
            page_max : 0,
            songs: result
        }
    }
   
    }
async function getSong(parent,{id,title},context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    if(id){
        const getSong = await songs.findById(id).lean()
        getSong.id = mongoose.Types.ObjectId(getSong.id);
                getSong.released = getSong.released.toLocaleString('default', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                })
        return getSong;
    }else if(title){
        const getSong = await songs.findOne({title: title}).lean()
        getSong.id = mongoose.Types.ObjectId(getSong.id);
                getSong.released = getSong.released.toLocaleString('default', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                })
        return getSong
    }else{
        return new ApolloError('FooError', {
            message: 'Put at least one parameter!'
          });
    }
}
async function addSong(parent,args,context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    const songExist = await songs.findOne(
        {title: args.title,artist: args.artist,genre: args.genre}
    )
    const newSong = new songs(args)
    if(songExist){
        return new ApolloError('FooError', {
            message: 'Song Already Exist!'
          });
    }else{
        await newSong.save()
        return newSong
    }
}
async function updateSong(parent,args){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    const updateSong = await songs.findByIdAndUpdate(args.id, args, {
        new : true
    })
    return updateSong
}

async function updatePlaylist(parent,args,context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    const updatePlaylist = await songPlaylist.findByIdAndUpdate(args.id, args, {
        new : true
    })
// console.log(updatePlaylist)
    console.log(updatePlaylist.songs)
    return updatePlaylist
}

async function deleteSong(parent,args,context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    const data = await songs.findById(args.id)
    const deleteSong = await songs.findByIdAndDelete(args.id, {
        new : false
    })
    return {deleteSong, message: 'Song Has been deleted!', data: data}
}

async function deletePlaylist(parent,{id},context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    const data = await songPlaylist.findById(id)
    const deletePlaylist = await songPlaylist.findByIdAndDelete(id, {
        new : true
    })
    return {deletePlaylist, message: 'Playlist has been deleted!', data: data}
}
async function createPlaylist(parent,args,context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    const newPlaylist = new songPlaylist(args)
    // console.log(songPlaylist)
    newPlaylist.save()
    return {newPlaylist, message: 'Playlist has been created!', data: newPlaylist}
}
async function getPlaylist(parent,args,context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    let getPlaylist = await songPlaylist.findById(args.id)
    console.log(getPlaylist)
    return getPlaylist
}
async function getAllPlaylist(parent,args,context){
    const token = context.req.headers.authorization
    jwt.verify(token, 'secret'),function(err,decoded){
        if(err){
            throw new ApolloError(err)
        }
    }
    let getAllPlaylist = await songPlaylist.find({})
    getAllPlaylist.map((playlist) => {
        playlist.totalDuration = 0
        // console.log(playlist)
        return {...playlist, totalDuration:0}
    })
    // console.log(getAllPlaylist)
    return getAllPlaylist
}
async function getSongLoader (parent, args, context){
    // let arr = []
// parent.songs.map((val) => arr.push(val))
// console.log(arr)
    // console.log(parent.songs)
    // let song
    // console.log(parent)
    if (parent._id){
    let cek = await context.songLoader.load(parent._id)
    console.log(cek)
    // totalDuration += cek.duration
    // console.log(cek)
    return cek
    }
    }
const resolvers = {
    Query: {
        getAllSongs,
        getSong,
        getAllPlaylist,
        getPlaylist,
    },
    Mutation: {
        addSong,
        updateSong,
        deleteSong,
        deletePlaylist,
        createPlaylist,
        updatePlaylist,
        getToken
    },
    songId: {
        songs: getSongLoader
        // async (parent) => {
        //     // console.log(parent.songs)
        //     // const song = await songs.find({
        //     //     _id: {
        //     //         $in: parent.songs
        //     //     }
        //     // })
        //     // console.log(song)
        //     const songLoader = new DataLoader((keys) => {
                
        //         const result = keys.map((songId) => {
        //             return songs.find((songs) => songs.id === songId)
        //         })
        //         return Promise.resolve(result)
        //     })
        //     console.log(parent.songs)

        //     return songLoader.load(parent.songs)
        //     // const idLoader = new DataLoader((keys) => {
        //     //     const result = keys.map((songId) => {
        //     //         return songs.find((songId) => songs._id ===songId)
        //     //     })
        //     // })
        // }
    }
}
module.exports = {resolvers}