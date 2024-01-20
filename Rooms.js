const mongoose = require('mongoose')

const { Schema } = mongoose

const RoomSchema = new Schema({
    roomID : {
        type : String,
        default : "",
        required: true
    },
    socketIDS : {
        type : Array,
        default: []
    },
    peerIDS : {
        type : Array,
        default: []
    },
    count : {
        type : Number,
        required : true,
        default : 0
    }
})

const RoomModel = mongoose.model('RoomsModel', RoomSchema)

module.exports = RoomModel