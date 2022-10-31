const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const events = require('events');
const { resolve } = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const eventEmitter = new events.EventEmitter();
const mongoose = require('mongoose');
const {songs,songPlaylist} = require('./schema');
//SONG PLAYLIST
const songsPlaylist = [
    {
        title : 'Despacito',
        artist : 'Luis Fonsi',
        genre : 'Pop',
        duration : 4,
        released : 2017
    },
    {
        title : 'Shape Of You',
        artist : 'Ed Sheeran',
        genre : 'Pop',
        duration : 5,
        released : 2017
    },
    {
        title : 'Rock Around the Clock',
        artist : 'Maxamus Freedman',
        genre : 'Rock',
        duration : 5,
        released : 2017
    },
    {
        title : 'Perfect',
        artist : 'Ed Sheeran',
        genre : 'Pop',
        duration : 5,
        released : 2017
    },
    {
        title : 'Blinding Lights',
        artist : 'The Weeknd',
        genre : 'R&B',
        duration : 4,
        released : 2019
    },
    {
        title : 'The Lazy Song',
        artist : 'Bruno Mars',
        genre : 'R&B',
        duration : 4,
        released : 2010
    },
    {
        title : 'Treasure',
        artist : 'Bruno Mars',
        genre : 'R&B',
        duration : 5,
        released : 2012
    },
    {
        title : 'Marry You',
        artist : 'Bruno Mars',
        genre : 'Pop',
        duration : 5,
        released : 2010
    },
    {
        title : 'Photograph',
        artist : 'Ed Sheeran',
        genre : 'Pop',
        duration : 4,
        released : 2010
    },
    {
        title : 'Calypso',
        artist : 'Luis Fonsi',
        genre : 'Pop',
        duration : 5,
        released : 2010
    },
{
    title : 'Despacito',
    artist : 'Luis Fonsi',
    genre : 'Pop',
    duration : 4,
    released : 2017
},
{
    title : 'Shape Of You',
    artist : 'Ed Sheeran',
    genre : 'Pop',
    duration : 5,
    released : 2017
},
{
    title : 'Rock Around the Clock',
    artist : 'Maxamus Freedman',
    genre : 'Rock',
    duration : 5,
    released : 2017
},
{
    title : 'Perfect',
    artist : 'Ed Sheeran',
    genre : 'Pop',
    duration : 5,
    released : 2017
},
{
    title : 'Blinding Lights',
    artist : 'The Weeknd',
    genre : 'R&B',
    duration : 4,
    released : 2019
},
{
    title : 'The Lazy Song',
    artist : 'Bruno Mars',
    genre : 'R&B',
    duration : 4,
    released : 2010
},
{
    title : 'Treasure',
    artist : 'Bruno Mars',
    genre : 'R&B',
    duration : 5,
    released : 2012
},
{
    title : 'Marry You',
    artist : 'Bruno Mars',
    genre : 'Pop',
    duration : 5,
    released : 2010
},
{
    title : 'Photograph',
    artist : 'Ed Sheeran',
    genre : 'Pop',
    duration : 4,
    released : 2010
},
{
    title : 'Calypso',
    artist : 'Luis Fonsi',
    genre : 'Pop',
    duration : 5,
    released : 2010
}

]
// FILTER BY ARTIST
function filterByArtist(arr, artist) {
    return arr.filter((song) => song.artist == artist);
  }
// FILTER BY GENRE
function filterByGenre(arr, genre) {
    return arr.filter((song) => song.genre == genre);
  }
// SAVE THE SONG DURATION
function songDuration(songs){
    let duration = 0;
    if (songs.length === 0) {
        return duration;
    }
    songs.forEach((song) => {
        duration += song.duration;
        
    });
    return duration;
    }

// FUNCTION FOR DURATION <1HOUR
function groupSong(arrObj, playFor){
    let song = [...arrObj];
    let songToPlay = [];
    let duration = 0
    while (duration < playFor){
        const songIndex = Math.floor(Math.random() * song.length);
        const songForPlay = song[songIndex];
        song.splice(songIndex, 1);
        duration = songDuration(songToPlay)  + songForPlay.duration;

        if (duration > playFor) {
            break
        }else{
            songToPlay.push(songForPlay);
        }}
        const words = `Total Duration of Song Playlist: ${songDuration(songToPlay)}`

        return {...songToPlay, 'Total Duration' : words};
        // console.log(songToPlay)
        // console.log(`Total Duration of Song Playlist: ${songDuration(songToPlay)}`);
    }
    // const users = {
    //     user : "cisi",
    //     password : "cisi"
    // }
    // app.get('/register',express.urlencoded({extended:true}),login ,function (req, res, next) {
    // let {user,password} = req.body
    // res.send(`${user} ${password}`)
    // })

    // function login(req, res, next) {
    //     let user = req.body.user
    //     let password = req.body.password
    // if (user == users.user && password == users.password) {
    //     res.send(password)
    //     next()
    // }else{
    //     err.message = "Wrong"
    //         res.send({
    //             err : err.message
    //         })
    //     };
    // }

    app.get('/authentication', (req,res,next) => {
        const authenticate = jwt.sign({
            data: 'zetta'
          }, 'secret', { expiresIn: '1h' });
        res.send(authenticate)
        console.log(authenticate)
    })
    app.use(authentication)



//SHOW PLAYLIST
app.get('/', function(req, res, next) {
    res.send(songsPlaylist);
     })



// FUNGSI AUTENTIKASI
function authentication(req, res, next) {
    let authenticate = req.headers.authorization;
    let err = new Error()
    if (!authenticate) {
        err.message = "Empty Token"
            res.send({
                err : err.message
            })
    }else{
        authenticate = authenticate.split(' ')[1]
        jwt.verify(authenticate, 'secret',(err,token)=>{
            if (err) {
                err.message = "Wrong Token"
                res.send({
                    err : err.message
                })
            }else{
                next()
            }
        });
    }



express.urlencoded({extended:true}),function login(req, res, next) {
    let {user,password} = req.body
    let err = new Error()
    if (user == users.user && password == users.password) {
        next()
    }else{
        err.message = "Wrong"
            res.send({
                err : err.message
            })
        };
    }

}
    // console.log(decoded)
    // console.log(decoded.foo) 
    // if (decoded.data === "zetta") {
    //     next()
    // }else{
    //     err = new Error("Wrong Token!");
    //     res.send({
    //         err : err.message
    //     })
    // }
// 
     //SHOW ARTIST
// app.get('/artist/:artist',function(req, res, next) {
//     let {artist} = req.params
//     artist = artist.toString()
//     res.send(filterByArtist(songsPlaylist, artist));
//     })


app.get('/artist', express.urlencoded({extended:true}),function(req, res, next) {
    let {artist} = req.body
    artist = artist.toString()
    res.send(filterByArtist(songsPlaylist, artist));
    })
    

     //SHOW GENRE
app.get('/genre/', express.urlencoded({extended:true}),function(req, res, next) {
    let {genre} = req.body
    genre = genre.toString()
    res.send(filterByGenre(songsPlaylist, genre));
    })


    //SHOW PLAYLIST < 1HOUR
app.get('/groupSong/:duration',function(req, res, next) {
    let {duration} = req.params
    duration = parseInt(duration)
    res.send(groupSong(songsPlaylist, duration))
    })






















app.listen(4000);