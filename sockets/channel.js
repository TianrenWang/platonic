const socketIo = require('socket.io');
const config = require('../config');

const channelsActivity = {};
const channelsQueue = {};
const connections = [];

const initialize = server => {

    const io = socketIo(server, { path: config.channelPath });

    io.on('connection', socket => {
        connections.push(socket);
        console.log("connected by channel socket");

        const makeAvailable = (channelId) => {
            channelsActivity[channelId].contributors.push(socket.username)
            let queue = channelsQueue[channelId];
            if (queue && queue.length) {
                let clientSocket = searchConnections(queue.shift())
                socket.emit('match', clientSocket.username)
                clientSocket.emit('match', socket.username)
                io.emit('busy_channel', channelId)
            } else {
                io.emit('available_channel', channelId)
            }
        };

        const joinQueue = (channelId) => {
            channelsQueue[channelId].push(socket.username)
            let channelActivity = channelsActivity[channelId];
            if (channelActivity && channelActivity.contributors && channelActivity.contributors.length) {
                let contrib_socket = searchConnections(channelActivity.contributors[0])
                socket.emit('match', contrib_socket.username)
                contrib_socket.emit('match', socket.username)
                io.emit('busy_channel', channelId)
            }
        };

        socket.on('username', data => {
            if (data.username) {
                socket.username = data.username;
            }
        });

        // When a contributor starts taking in clients
        socket.on('accept', channelId => {
            if (channelId) {
                if (!channelsActivity[channelId]){
                    channelsActivity[channelId] = {active: true, contributors: []};
                } else {
                    channelsActivity[channelId].active = true;
                }
                makeAvailable(channelId);
            }
        });

        // When a client request for a contributor to chat
        socket.on('request', channelId => {
            if (channelId) {
                if (!channelsQueue[channelId]){
                    channelsQueue[channelId] = [];
                }
                joinQueue(channelId);
            }
        });

        // When a contributor leaves taking in clients
        socket.on('leave contribution', channelId => {
            if (channelId) {
                let channelActivity = channelsActivity[channelId];
                for(var i = 0; i < channelActivity.contributors.length; i++) {
                    if (channelActivity.contributors[i] === socket.username) {
                        channelActivity.contributors.splice(i, 1);
                    }
                }
                if (channelActivity.contributors.length === 0){
                    channelActivity.active = false;
                }
            }
        });
        
        // When a client request for a contributor to chat
        socket.on('leave queue', channelId => {
            if (channelId) {
                let channelQueue = channelsQueue[channelId];
                for(var i = 0; i < channelQueue.length; i++) {
                    if (channelQueue[i] === socket.username) {
                        channelQueue.splice(i, 1);
                    }
                }
            }
        });
    });
};

const searchConnections = username => {
    for (let conn of connections) {
        if (conn.username == username) {
            return conn
        }
    }
};

module.exports = initialize;
