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

// FUNGSI UNTUK NYIMPEN DURASI
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

// FUNGSI UNTUK GROUP PLAYLIST
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
        console.log(songToPlay)
        console.log(`Total Duration of Song Playlist: ${songDuration(songToPlay)}`);

        
        return true
    }

// console.log("\n=====Songs by Artist=====")
// console.log(filterByArtist(songsPlaylist, 'Ed Sheeran'));

// console.log("======================\n")

// console.log("\n=====Songs by Genre=====")
// console.log(filterByGenre(songsPlaylist, 'Pop'));
// console.log("======================\n")

console.log("\n=====Songs Playlist=====")
console.log(groupSong(songsPlaylist, 60))
console.log("======================\n")