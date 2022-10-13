const songsPlaylist = [
        {
            title : 'Despacito',
            artist : 'Luis Fonsi',
            genre : 'Pop',
            duration : 4,
            released : 2017,
            sold : 38000000000
        },
        {
            title : 'Shape Of You',
            artist : 'Ed Sheeran',
            genre : 'Pop',
            duration : 5,
            released : 2017,
            sold : 42000000000
        },
        {
            title : 'Rock Around the Clock',
            artist : 'Maxamus Freedman',
            genre : 'Rock',
            duration : 5,
            released : 2017,
            sold : 25000000000
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
        released : 2017,
        sold : 38000000000
    },
    {
        title : 'Shape Of You',
        artist : 'Ed Sheeran',
        genre : 'Pop',
        duration : 5,
        released : 2017,
        sold : 42000000000
    },
    {
        title : 'Rock Around the Clock',
        artist : 'Maxamus Freedman',
        genre : 'Rock',
        duration : 5,
        released : 2017,
        sold : 25000000000
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
function groupSong(arr, playFor = 60){
    let song = [...arr];
    let songToPlay = [];
    while (true){
        const songIndex = Math.floor(Math.random() * song.length);
        const songForPlay = song[songIndex];
        song.splice(songIndex, 1);
        const duration = songDuration(songToPlay);
        if (duration + songForPlay.duration  > playFor) {
            break
        }else{
            songToPlay.push(songForPlay);
        }}
        console.log(songToPlay)
        console.log(songDuration(songToPlay));
    }

// songDuration(songsPlaylist);
console.log(groupSong(songsPlaylist))
// console.log("\n=====Songs by Artist=====")
// console.log(filterByArtist(songsPlaylist, 'Bruno Mars'));

// console.log("======================\n")

// console.log("\n=====Songs by Genre=====")
// console.log(filterByGenre(songsPlaylist, 'Rock'));
// console.log("======================\n")