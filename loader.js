// import dataloader
const DataLoader = require('dataloader');
const {songs,songPlaylist} = require('./schema');


let totalDuratiom = 0
// import model
const loadSong = async function(checkId){
let songList = await songs.find({
_id: {
$in: checkId
}
})
console.log(songList)
let songMap = {};

songList.forEach((n) => {
songMap[n._id] = n
// totalDuratiom += n.duration
// console.log(totalDuratiom)
return totalDuratiom 
})
// songList.forEach((el) => {
//     console.log(el.duration)
// })
// console.log(songList[1].duration)
return checkId.map(id => songMap[id])
}

const songLoader = new DataLoader(loadSong);
module.exports = songLoader;