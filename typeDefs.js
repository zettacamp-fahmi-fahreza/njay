
const { ApolloServer,gql } = require('apollo-server');

const {songs,songPlaylist} = require('./schema');

const typeDefs = gql`#graphql

type Song {
  id: ID
  title: String
  artist: String
  genre: String
  duration: Int
  released: String
}
# type songForPlaylist {
#   song: Song
# }
type login{
  message: String
}
type pageSong{
  songs: [Song]
  count: Int
  page: Int
  page_max: Int
}
type songId {
  songs : Song
}
type Playlist {
  id: ID
  playlistName: String
  songs: [songId]
  # songs: [Song]
  totalDuration: Int
  # add Total duration Later
}
type respondDelSong{
  message: String,
  data: Song
}
type respondCreate{
  message: String,
  data: Playlist
}

type respondDelPlaylist{
  message: String,
  data: Playlist
}
type Mutation{
  addSong(
  title: String!
  artist: String!
  genre: String!
  duration: Int!
  released: String!
  ) : Song!
  createPlaylist(
  playlistName: String!
  songs: [ID]!
  totalDuration: Int
  ) : respondCreate
  updateSong(
    id: ID!
  title: String
  artist: String
  genre: String
  duration: Int
  released: String
  ) : Song!
  getToken(username: String!, password: String!) : login
  updatePlaylist(
    id: ID!
    playlistName: String
    songs: [ID]
    totalDuration : Int
  ) : Playlist

  deleteSong(id : ID!): respondDelSong!

  deletePlaylist(id : ID!): respondDelPlaylist!
}
type Query {
  getAllSongs(page:Int, limit: Int) : pageSong
  getSong(id: ID,title: String) : Song
  getAllPlaylist: [Playlist]
  getPlaylist(id: ID!): Playlist
}`

module.exports = {typeDefs}