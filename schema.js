const express = require('express');
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
            title : {
                type:String,
                default:"title"
            },
            artist :  {
                type:String,
                default:"title"
            },
            genre :  {
                type:String,
                default:"title"
            },
            duration :  {
                type:String,
                default:"title"
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
    totalDuration : Number
})
const songPlaylist = mongoose.model("songPlaylist", songPlaylistSchema);

module.exports.songs = songs;
module.exports.songPlaylist = songPlaylist;
