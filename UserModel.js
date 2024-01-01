const mongoose = require('mongoose')

const { Schema } = mongoose

const UserSchema = new Schema({
    // socketID : {
    //     type : String,
    //     required : true
    // },
    peerID : {
        type : String,
        required : true
    },
    status : {
        type : Boolean,
        required : true,
        default : false
    }
})

const UserModel = mongoose.model('UserModel', UserSchema)

module.exports = UserModel