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
const { ApolloServer,gql } = require('apollo-server');
const{resolvers} = require('./resolver');
const {typeDefs} = require('./typeDefs');
const DataLoader = require('dataloader');
const songLoader = require('./loader.js');
const { makeExecutableSchema } = require('@graphql-tools/schema')

connectDB().catch((err) => console.log(err));
async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/zetta");
}
connectDB();
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
function filterByArtist(arr, artist) {
    return arr.filter((song) => song.artist == artist);
  }
function filterByGenre(arr, genre) {
    return arr.filter((song) => song.genre == genre);
  }
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
    }
    

    app.get('/authentication', (req,res,next) => {
        const authenticate = jwt.sign({
            data: 'zetta'
          }, 'secret', { expiresIn: '1h' });
        res.send(authenticate)
        console.log(authenticate)
    })
    // app.use(authentication)

    app.get("/allSongs",express.urlencoded({ extended: true }), async function (req, res, next) {
        let {match,sort,skip,limit} = req.body;
        sort = parseInt(sort)
        const showSongs = await songs.aggregate([
            {$facet: {
                "categorizedByArtist" :[
                    {$match : {
                        artist : match
                    }},{
                        $sort: {title : sort}
                    }
                ]
                ,"categorizedByGenre" :[
                    {$group:{
                        _id: "$genre",
                        totalSong: {$sum: 1}
                    }}
                ]
            }}
        ]);
        res.send(showSongs);
    });

    app.get("/allPlaylist",express.urlencoded({ extended: true }), async function (req, res, next) {
        let {match,sort,page,limit=1} = req.body;
        // rating_star = rating_star.split(",").map(Number)
        sort = parseInt(sort)
        page = parseInt(page)
        limit = parseInt(limit)
        // match = mongoose.Types.ObjectId(match)
        const showPlaylist = await songPlaylist.aggregate([
            {
                $lookup:{
                    from: "songs",
                    localField: "songs",
                    foreignField: "_id",
                    as:"songs.song_detail"
                }},{
                    $addFields:{
                        totalDuration:{$sum: "$songs.song_detail.duration"}}
            },{
                $facet: {
                    count: [
                        {
                            $group: {
                                _id: null,
                                totalDocs: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0
                            }
                        }
                    ],
                    data: [
                        {$sort:{playlistName: sort}},
                        {$match:{
                            "songs.song_detail.artist": match
                            // "songs.song_detail._id": match
                        }},
                        {$skip: page * limit},
                        {$limit: limit},
                        // {$addFields:{
                        //     page:`${page} / ${Math.floor(await songPlaylist.count()/limit)}`
                        // }}
                    ]
                }
            }
        ]);
        res.send(showPlaylist);
    });
    app.get('/songs/:_id',async (req, res, next)=>{
        let {_id} = req.params;
        _id = mongoose.Types.ObjectId(_id)
        const displaySong = await songs.aggregate([
            {$match: {_id: _id}}
        ])
        res.send(displaySong)
    })

    app.post('/songs',express.urlencoded({extended:true}),async (req, res, next)=>{
        const {song} = req.body;
        const saveSong = new songs(song)
        await saveSong.save();
        res.send(saveSong)
    })

    app.patch('/songs/:_id',express.urlencoded({extended:true}),async (req, res, next)=>{
        const {_id} = req.params;
        const {song} = req.body;
        // _id = mongoose.Types.ObjectId(_id)
        if (!_id) {
            let err = new Error("ID is wrong or empty");
            res.send({
                err: err.message,
            });
        } else {
            const updateSong = await songs.findByIdAndUpdate(_id, song, {
                new: true,
            });
            res.send(updateSong);
        }
    })

    app.delete(
        "/songs/:_id",
        express.urlencoded({ extended: true }),
        async function (req, res, next) {
            const { _id } = req.params;
            if (!_id) {
                let err = new Error("ID is wrong or empty");
                res.send({
                    err: err.message,
                });
            } else {
                const deleteSong = await songs.findByIdAndDelete(_id, { new: true });
                res.send(
                    `You have deleted:
                ${deleteSong}`
                );
            }
        }
    );

    app.post('/playlist',express.urlencoded({extended:true}),async (req, res, next)=>{
        let {playlist} = req.body;
        playlist.songs = playlist.songs.split(" ").map((el)=>{
            return mongoose.Types.ObjectId(el)
        })
        const savePlaylist = new songPlaylist(playlist)
        await savePlaylist.save();
        // let aggregate = await songPlaylist.aggregate([
            // {
            //     $lookup:{
            //         from: "songs",
            //         localField: "songs",
            //         foreignField: "_id",
            //         as:"songs.song_detail"
            //     }
            // },{
        //         $addFields:{totalDuration:{$sum: "$song_detail.duration"}}
        //     }
        // ])
        res.send(savePlaylist)
    })
    
    app.get('/playlist',express.urlencoded({extended:true}),async (req, res, next)=>{
        try{
            let {_id} = req.body;
            
            if(!_id){
                let err = new Error("ID is wrong or empty");
                res.send({
                    err: err.message,
                });
            }else{
                _id = _id.split(" ").map((el)=>{
                    return mongoose.Types.ObjectId(el)
                })
                const displayPlaylist = await songPlaylist.aggregate([
                    {$match: {$or:[
                        {songs: _id[0]},{songs: _id[1]}
                    ]}},
                    {
                        $lookup:{
                            from: "songs",
                            localField: "songs",
                            foreignField: "_id",
                            as:"songs.song_detail"
                        }
                    },
                    
                ])
                res.send(displayPlaylist)
            } 
        }catch(err) {
            res.send(err)
        }
    })

    app.patch("/playlist",express.urlencoded({extended:true}),async (req, res, next)=>{
        try{
            let {_id,playlist} = req.body;
            if(!_id){
                let err = new Error("ID is wrong or empty");
                res.send({
                    err: err.message,
                });
            }else{
                _id = mongoose.Types.ObjectId(_id)
            const updatePlaylist = await songPlaylist.findByIdAndUpdate(_id, playlist, {
                new: true,
            });
            res.send(updatePlaylist);
        }
        }catch(err){
            next(err)
        }
    });

    app.delete("/playlist",express.urlencoded({extended: true}),async(req, res, next)=>{
        const {_id} = req.body;
        if (!_id) {
            let err = new Error("ID is wrong or empty");
            res.send({
                err: err.message,
            });
        } else {
            const deletePlaylist = await songPlaylist.findByIdAndDelete(_id, {
                new: true,
            });
            res.send(
                `You have deleted:
            ${deletePlaylist}`
            )};
    });

    




//SHOW PLAYLIST
app.get('/', function(req, res, next) {
    res.send(songsPlaylist);
     })



// FUNGSI AUTENTIKASI
// function authentication(req, res, next) {
//     let authenticate = req.headers.authorization;
//     let err = new Error()
//     if (!authenticate) {
//         err.message = "Empty Token"
//             res.send({
//                 err : err.message
//             })
//     }else{
//         authenticate = authenticate.split(' ')[1]
//         jwt.verify(authenticate, 'secret',(err,token)=>{
//             if (err) {
//                 err.message = "Wrong Token"
//                 res.send({
//                     err : err.message
//                 })
//             }else{
//                 next()
//             }
//         });
//     }



// express.urlencoded({extended:true}),function login(req, res, next) {
//     let {user,password} = req.body
//     let err = new Error()
//     if (user == users.user && password == users.password) {
//         next()
//     }else{
//         err.message = "Wrong"
//             res.send({
//                 err : err.message
//             })
//         };
//     }

// }
//     // console.log(decoded)
//     // console.log(decoded.foo) 
//     // if (decoded.data === "zetta") {
//     //     next()
//     // }else{
//     //     err = new Error("Wrong Token!");
//     //     res.send({
//     //         err : err.message
//     //     })
//     // }
// // 
//      //SHOW ARTIST
// // app.get('/artist/:artist',function(req, res, next) {
// //     let {artist} = req.params
// //     artist = artist.toString()
// //     res.send(filterByArtist(songsPlaylist, artist));
// //     })


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


    // async function SongsGeneratorEN(){
    //     let index = 1;
    //     let titleEn =
    //     [
    //     'Cool Off Moves',
    //     'Slump Summertime',
    //     'Calm Options',
    //     'Black Flies',
    //     'Forget About Your Influence',
    //     '100 Years',
    //     'A Time Of Gem',
    //     'Hymn Of Conversation',
    //     'Private Driving',
    //     'The Teenager','Talking To The Moon','Solid','Thats What I Like','Runaway Baby'
    //     ];
        
    //     let artistFEn = ['Boy', 'Dona', 'Luke', 'Bruno', 'The', 'Asking', 'Aria', 'Michael'];
    //     let artistLEn = ['Swift', 'Sarasvati', 'Gold', 'Jonas', 'Alexandria', 'Reeves', 'Pichu']
        
    //     let genre = ['EDM', 'Pop', 'Rock'];
    //     let duration = [3,3,4,4,5,5,6,4,5,2,4];
        
    //     for (let [id, val] of titleEn.entries()){
    //     let result = await new songs({
    //     // index : index,
    //     title: `${val}`,
    //     artist: `${artistFEn[Math.floor(Math.random() * artistFEn.length)]} ${artistLEn[Math.floor(Math.random() * artistLEn.length)]}`,
    //     genre: `${genre[Math.floor(Math.random() * genre.length)]}`,
    //     duration: `${duration[Math.floor(Math.random() * duration.length)]}`,
    //     released: new Date()

    //     })
        
    //     console.log(result)
    //     result.save()
    //     // index++
    //     }}




// app.listen(4000);


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: function ({req}) {
      return {
          songLoader,
          req : req
      };}
    // context: () => ({
    //   loaders: loaders(),
    // }),
  
  });

//   server.start().then(res => {
//     server.applyMiddleware({
//         app
//     });
//     // run port 
//     app.listen(port, () => {
//         console.log(`App running in port ${port}`);
//     });
// });

server.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);