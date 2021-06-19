const express = require('express')
const app = express()
const server = require('http').Server(app)
const { v4: uuidv4 } = require('uuid')
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
    debug: true,
})
const $ = require('jquery')

// setup app
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs', peerServer)

// endpoints
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

// listener
server.listen(process.env.PORT || 3030)

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        console.log('roomId', roomId)
        socket.to(roomId).emit('user-connected', userId)
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message)
        })
    })
})
