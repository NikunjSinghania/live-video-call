const express = require('express')
const app = express()
const server =require('http').Server(app)
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

app.post('/peers-data', (req, res) => {
    UserModel.find({socketID: {$ne: req.body.mySocketId}}, {status : false}).then(data => {
        console.log(data)
        res.send(data)
    })
})

io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('data', (data) => {
        UserModel.create({
            socketID : data.mySocketId,
            peerID : data.myPeerId
        }).then(data => {
            console.log('DATA INSERTED')
            socket.emit('1')
        })
    })

})

server.listen(4000)