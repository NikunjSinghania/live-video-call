// initialize express
const express = require('express');
const app = express();
const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

const options_s = {
    key:fs.readFileSync(path.join(__dirname,'./cert/key.pem')),
    cert:fs.readFileSync(path.join(__dirname,'./cert/cert.pem')),

    requestCert: false,
    rejectUnauthorized: false
}

// const server = https.createServer(options_s, app)
const server = http.createServer(app)

const mongoose = require('mongoose')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid');
const chalk = require('chalk')

mongoose.connect('mongodb+srv://nikunj05108:qwertylana@data.ulz8yxy.mongodb.net/?retryWrites=true&w=majority').then(data => {
    console.log('DB CONNNECTED')
})

const UserModel = require('./UserModel')
const RoomsModel = require('./Rooms')

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

app.get('/', (req, res) => {
    res.send('asda')
})

io.on('connection', (socket) => {
    console.log(chalk.white.bgBlack.bold(`SOCKET ID ----------> ${socket.id}`))
    //chalk.white.bgBlack.bold(`SOCKET ID ----------> ${socket.id}`)
    //console.log(`SOCKET ID ----------> ${socket.id}`)

    socket.on('disconnect', function(){
        RoomsModel.findOne({'socketIDS' : socket.id}).then((data) => {
            console.log(data)
            if(data == null) {
                console.log(chalk.white.bgRedBright.bold('ROOM NOT EXISTS'))
            }else {
                if(data.count === 1) {
                    RoomsModel.deleteOne({'_id' : data._id}).then(() => {
                        UserModel.deleteOne({socketID : socket.id}).then(() => {
                            // chalk.white.bgRedBright.bold('User Disconnected And Deleted')
                            console.log(chalk.white.bgRedBright.bold('User Disconnected And Deleted'));
                        })
                        // chalk.yellow.bgRedBright.bold('ROOM DELETED')
                        console.log(chalk.yellow.bgRedBright.bold('ROOM DELETED'))
                    })
                }else {
                    UserModel.findOne({'socketID' : socket.id}, { peerID: 1 }).then(fr => {
                        UserModel.deleteOne({socketID : socket.id}).then(() => {
                            RoomsModel.updateOne({ '_id' : data._id }, { $pull : { 'socketIDS' : socket.id, 'peerIDS' : fr.peerID }, 'count' : 1 }).then(() => {
                                io.to(data.roomID).emit('SBHH')
                                // chalk.green.bgRedBright.bold('User Disconnected And Deleted')
                                console.log(chalk.green.bgRedBright.bold('User Disconnected And Deleted'));
                            })
                        })
                    })
                }
            }
        })

    });

    socket.on('data', (data) => {
        UserModel.create({
            socketID : data.mySocketId,
            peerID : data.myPeerId
        }).then(() => {
            console.log(chalk.white.bgGreen.bold('User Created'))
        }).catch(err => {
            console.log(chalk.red.bgGreen.bold('User not Created'))
        })

        RoomsModel.findOne({'count' : { $eq : 1 } , 'socketIDS' : {$ne: data.mySocketId} }).then(res => {
            if(res == null) {
                const ROOM_ID = uuidv4();
                RoomsModel.create({ 'roomID' : ROOM_ID, 'socketIDS' : [data.mySocketId] , 'peerIDS' : [data.myPeerId], 'count' : 1 }).then(c => {
                    socket.join(ROOM_ID)
                    UserModel.updateOne({ socketID : socket.id }, { $set : { 'roomID' : ROOM_ID } }).then(() => {
                        console.log(chalk.white.bgGreen.bold('ROOM CREATED SUCCESSFULLY AND USER ROOM ID UPDATED'))
                    })
                })
            }else {
                RoomsModel.updateOne({ '_id' : res._id }, { $push : { 'socketIDS' : data.mySocketId, 'peerIDS' : data.myPeerId } ,  count : 2 } ).then(u => {

                    UserModel.updateOne({ socketID : socket.id }, { $set : { 'roomID' : res.roomID } }).then(() => {
                        console.log(chalk.white.bgGreen.bold('USER ROOM ID UPDATED'))
                    })

                    socket.join(res.roomID)
                    socket.emit('ROOM_FULL', { PEER_ID : res.peerIDS[0], CHANGE_OCCUR : false })
                    io.to(res.roomID).emit('WRON', { roomID : res.roomID })
                    console.log(chalk.yellow.bgGreen.bold('ROOM UPDATED SUCCESSFULLY'))
                })
            }
        })

    })

    socket.on('change', (data) => {
        console.log(chalk.blue.bgYellowBright.bold('CHANGE START'))
        console.log(chalk.white.bgYellowBright.bold('-------------'))
        console.log(data)
        console.log(chalk.white.bgYellowBright.bold('-------------'))

        RoomsModel.findOne({'count' : { $eq : 1 } , 'socketIDS' : {$ne: data.mySocketId } }).then(res => {
            console.log(chalk.white.bgYellowBright.bold('-------------'))
            console.log(res)
            console.log(chalk.white.bgYellowBright.bold('-------------'))
            if(res == null) {
                console.log(chalk.white.bgYellowBright.bold('NO ROOM AVAILABLE'))
            }else {
                RoomsModel.updateOne({ 'roomID' : data.roomID }, { $pull : { 'socketIDS' : data.mySocketId, 'peerIDS' : data.myPeerId}, $inc : { count : -1} }).then(() => {
                    //io.to(data.roomID).emit('SBHH')
                    console.log(chalk.red.bgYellowBright.bold('ROOM UPDATE ____ User Disconnected And Deleted'));

                    UserModel.updateOne({ socketID : data.mySocketId }, { $set : { 'roomID' : "" } }).then(() => {
                        console.log(chalk.white.bgGreen.bold('USER ROOM ID UPDATED'))
                    })

                    RoomsModel.updateOne({ '_id' : res._id }, { $push : { 'socketIDS' : data.mySocketId, 'peerIDS' : data.myPeerId } ,  count : 2 } ).then(u => {
                        RoomsModel.findOne({'roomID' : data.roomID}).then((rfdata) => {

                            console.log(chalk.green.bgYellowBright.bold('INSIDE DATA --'))

                            console.log(rfdata)

                            console.log(chalk.green.bgYellowBright.bold('INSIDE DATA END --'))

                            if(rfdata === null) {
                                console.log(chalk.red.bgYellowBright.bold('<----- NO DATA ------>'))
                            }else if(rfdata.count === 0) {
                                RoomsModel.deleteOne({ 'roomID' : data.roomID }).then(() => {
                                    console.log(chalk.green.bgYellowBright.bold('ROOM DELETED! ROOM DELETED!'))
                                })
                            }
                        })

                        UserModel.updateOne({ socketID : data.mySocketId }, { $set : { 'roomID' : res.roomID } }).then(() => {
                            console.log(chalk.white.bgGreen.bold('USER ROOM ID UPDATED'))
                        })


                        socket.join(res.roomID)
                        socket.emit('ROOM_FULL', { PEER_ID : res.peerIDS[0], CHANGE_OCCUR : true })
                        io.to(res.roomID).emit('WRON', { roomID : res.roomID })
                        console.log(chalk.black.bgYellowBright.bold('ROOM UPDATE ____ ROOM UPDATED SUCCESSFULLY'))
                    })
                })
            }
        })
    })

    socket.on('close_conn', () => {
        console.log(chalk.white.bgGray.bold(`CONNECTION CLOSED`))
        socket.emit('close_stream')
    })

})




// create express peer server
const ExpressPeerServer = require('peer').ExpressPeerServer;

const options = {
    debug: true
}

// create a http server instance to listen to request

const peer = ExpressPeerServer(server, options)



// peerjs is the path that the peerjs server will be connected to.
app.use('/peerjs', peer);
// Now listen to your ip and port.



server.listen(8848, () => {
    console.log('Server ON AT 8848')
});