const express = require('express');
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
            title : String,
            artist : String,
            genre : String,
            duration : Number,
            released : Date
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
