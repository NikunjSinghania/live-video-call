// initialize express
var express = require('express');
var app = express();
var fs = require('fs')
var path = require('path')
var server = require('http').createServer(app)
const mongoose = require('mongoose')
const cors = require('cors')
mongoose.connect('mongodb+srv://nikunj05108:qwertylana@data.ulz8yxy.mongodb.net/?retryWrites=true&w=majority').then(data => {
    console.log('DB CONNNECTED')
})

const UserModel = require('./UserModel')
app.use(express.json())

app.use(
    cors({
        origin : "*"
    })
)

const io =require('socket.io')(server, {
    cors : {
        origin : "*"
    }
})

// app.post('/peers-data', (req, res) => {
//     UserModel.find({socketID: {$ne: req.body.mySocketId}}, {status : false}).then(data => {
//         console.log(data)
//         res.send(data)
//     })
// })

io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('data', (data) => {
        UserModel.create({
            peerID : data.myPeerId
        })
    })

    socket.on('update', (data) => {
        //console.log(data)
        UserModel.updateMany({ "peerID" : {"$in" : data.peersCollection} }, {$set : {status : true}}).then(res => {
            console.log('UPDATED')
        })
    })

    socket.on('peersData', (data) => {
        UserModel.find({"peerID": {"$ne": data.myPeerId}, "status": false}).then(res => {
            socket.emit('peers', res)
        })
    })

    socket.on('close_conn', () => {
        socket.emit('close_stream')
    })

})




// create express peer server
var ExpressPeerServer = require('peer').ExpressPeerServer;

var options = {
    debug: true
}

// create a http server instance to listen to request

let peer = ExpressPeerServer(server, options)



// peerjs is the path that the peerjs server will be connected to.
app.use('/peerjs', peer);
// Now listen to your ip and port.



server.listen(8878, "localhost");