const mongoose = require('mongoose')

const { Schema } = mongoose

const UserSchema = new Schema({
    socketID : {
        type : String,
        unique : true,
        required : true
    },
    peerID : {
        type : String,
        unique : true,
        required : true
    },
    roomID : {
        type : String,
        default : ""
    }
})

const UserModel = mongoose.model('UserModel', UserSchema)

module.exports = UserModel