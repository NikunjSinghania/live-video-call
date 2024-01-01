const express = require("express");
const { ExpressPeerServer } = require("peer");
const cors = require('cors')

const app = express();

app.get("/", (req, res, next) => res.send("Hello world!"));

// =======

app.use(cors({
    origin : "*"
}))

const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
    path: "/peerjs/id",
});

app.use("/myapp", peerServer);

peerServer.on('connection', (client) => {
    console.log(client)
});


// == OR ==
//
// const http = require("http");
//
// const server = http.createServer(app);
// const peerServer = ExpressPeerServer(server, {
//     debug: true,
//     path: "/myapp",
// });
//
// app.use("/peerjs", peerServer);
//
// server.listen(9000);