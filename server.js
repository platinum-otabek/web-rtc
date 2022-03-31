const express = require('express')
const app = express()
    // const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

const privateKey = fs.readFileSync('/etc/letsencrypt/trb.pem', 'utf-8');
const certificate = fs.readFileSync('/etc/letsencrypt/trb.pem', 'utf-8');
const credentials = { key: privateKey, cert: certificate };

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

const httpsServer = https.createServer(
    credentials,
    app);
httpsServer.listen(3000);