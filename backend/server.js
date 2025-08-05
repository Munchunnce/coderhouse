require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const DbConnect = require('./database');
const router = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const ACTIONS = require('./action');



const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})


app.use(cookieParser());

const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000'],
};

app.use(cors(corsOption));
app.use('/storage',express.static('storage'));


const PORT = process.env.PORT || 5500;
DbConnect();
app.use(express.json({ limit: '8mb'}))  // express.json() ye mera middleware hai ye inbuilt aati hai 
app.use(router);

app.get('/', (req, res) => {
    res.send('Hello from express js')
})

// Sockets connection
const socketUserMap = {

}

io.on('connection', (socket) => {
    console.log('New connection', socket.id);
    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMap[socket.id] = user;
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user,
            });
            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMap[clientId],
            });
        });
        socket.join(roomId);
    });

    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate,
        });
    });

    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription,
        });
    });

    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id,
                userId,
            });
        });
    });

    socket.on(ACTIONS.MUTE_INFO, ({ userId, roomId, isMute }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            if (clientId !== socket.id) {
                console.log('mute info');
                io.to(clientId).emit(ACTIONS.MUTE_INFO, {
                    userId,
                    isMute,
                });
            }
        });
    });

    const leaveRoom = () => {
        const { rooms } = socket;
        Array.from(rooms).forEach((roomId) => {
            const clients = Array.from(
                io.sockets.adapter.rooms.get(roomId) || []
            );
            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMap[socket.id]?.id,
                });

                // socket.emit(ACTIONS.REMOVE_PEER, {
                //     peerId: clientId,
                //     userId: socketUserMap[clientId]?.id,
                // });
            });
            socket.leave(roomId);
        });
        delete socketUserMap[socket.id];
    };

    socket.on(ACTIONS.LEAVE, leaveRoom);

    socket.on('disconnecting', leaveRoom);
});

server.listen(PORT, () => console.log(`Lestening on port ${PORT} `));




// new code
// require('dotenv').config();
// const express = require('express');
// const app = express();
// const server = require('http').createServer(app);
// const DbConnect = require('./database');
// const router = require('./routes');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');

// const ACTIONS = require('./action');

// const io = require('socket.io')(server, {
//     cors: {
//         origin: 'http://localhost:3000',
//         methods: ['GET', 'POST'],
//     },
// });

// app.use(cookieParser());

// const corsOption = {
//     credentials: true,
//     origin: ['http://localhost:3000'],
// };

// app.use(cors(corsOption));
// app.use('/storage', express.static('storage'));

// const PORT = process.env.PORT || 5500;
// DbConnect();
// app.use(express.json({ limit: '8mb' }));
// app.use(router);

// app.get('/', (req, res) => {
//     res.send('Hello from express js');
// });

// // Sockets connection
// const socketUserMapping = {};

// io.on('connection', (socket) => {
//     console.log('Connection', socket.id);

//     socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
//         socketUserMapping[socket.id] = { ...user };
//         socket.join(roomId);

//         // Pehle se jo clients room me hain unka data naye user ke pass bhejna
//         const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

//         clients.forEach((clientId) => {
//             if (clientId !== socket.id) {
//                 // naye user ke pass purane clients ka data bhejna
//                 socket.emit(ACTIONS.ADD_PEER, {
//                     peerId: clientId,
//                     createOffer: true,
//                     user: { ...socketUserMapping[clientId] }, // Ensure a new copy is sent
//                 });
        
//                 // purane clients ke pass naye user ka data bhejna
//                 io.to(clientId).emit(ACTIONS.ADD_PEER, {
//                     peerId: socket.id,
//                     createOffer: false,
//                     user: { ...user }, // Send new user's data properly
//                 });
//             }
//         });
        
//     });

//     // Handle realy ice
//     socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
//         io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
//             peerId: socket.id,
//             icecandidate,
//         });
//     });

//     // Handle realy sdp
//     socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
//         io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
//             peerId: socket.id,
//             sessionDescription,
//         });
//     });

//     // Handle mute/unMute
//     socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
//         const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
//         clients.forEach((clientId) => {
//             io.to(clientId).emit(ACTIONS.MUTE, {
//                 peerId: socket.id,
//                 userId,
//             });
//         });
//     });

//     socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
//         const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
//         clients.forEach((clientId) => {
//             io.to(clientId).emit(ACTIONS.UNMUTE, {
//                 peerId: socket.id,
//                 userId,
//             });
//         });
//     });

//     // Handle user leaving
//     const leaveRoom = (roomId, socketId) => {
//         if (!socketId || !roomId) return;

//         const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

//         clients.forEach((clientId) => {
//             if (clientId !== socketId) {
//                 io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
//                     peerId: socketId,
//                     userId: socketUserMapping[socketId]?.id,
//                 });
//             }
//         });

//         socket.leave(roomId);
//         delete socketUserMapping[socketId];
//     };

//     socket.on(ACTIONS.LEAVE, ({ roomId }) => {
//         leaveRoom(roomId, socket.id);
//     });

//     socket.on('disconnecting', () => {
//         const rooms = Array.from(socket.rooms);
//         rooms.forEach((roomId) => {
//             leaveRoom(roomId, socket.id);
//         });
//     });
// });

// server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
