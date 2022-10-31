const express = require('express');
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
            title : {
                type:String,
                default:"title"
            },
            artist :  {
                type:String,
                default:"artist"
            },
            genre :  {
                type:String,
                default:"genre"
            },
            duration :  {
                type:Number,
                default:0
            },
            released :  {
                type:Date,
                default:new Date()
            },
})
const songs = mongoose.model("Songs",songSchema)

const songPlaylistSchema = new mongoose.Schema({
    playlistName: String,
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Songs"
        }
    ],
    // totalDuration : {
    //     type: Number,
    //     default: 0
    // }
})
const songPlaylist = mongoose.model("songPlaylist", songPlaylistSchema);

module.exports.songs = songs;
module.exports.songPlaylist = songPlaylist;
