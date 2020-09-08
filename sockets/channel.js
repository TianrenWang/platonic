const socketIo = require('socket.io');
const config = require('../config');

const channels = {};
const userLocation = {};
const connections = [];

const initialize = server => {

    const io = socketIo(server, { path: config.channelPath });

    io.on('connection', socket => {
        const removeSocketFromList = (list) => {
            for(var i = 0; i < list.length; i++) {
                if (list[i] === socket) {
                    list.splice(i, 1);
                    return true;
                }
            }
            return false;
        };

        const removeSocketFromChannel = (channelId) => {
            let channel = channels[channelId];
            if (removeSocketFromList(channel.available, socket)){
                if (channel.available.length === 0){
                    if (channel.in_chat.length){
                        io.emit('busy_channel', channelId);
                    } else {
                        io.emit('unavailable_channel', channelId);
                    }
                }
            } else if (removeSocketFromList(channel.in_chat, socket)){
                if (channel.in_chat.length === 0 && !channel.available.length){
                    io.emit('unavailable_channel', channelId);
                }
            } else {
                removeSocketFromList(channel.queue, socket)
            }
        };
        
        connections.push(socket);
        console.log("connected by channel socket");

        socket.on('username', data => {
            if (data.username) {
                socket.username = data.username;
            }
        });

        // When a contributor starts taking in clients
        socket.on('accept', channelId => {
            if (channelId) {
                userLocation[socket.username] = channelId;
                createChannel(channelId);
                let queue = channels[channelId].queue;
                channels[channelId].available.push(socket);
                if (queue.length) {
                    let clientSocket = queue.shift();
                    let contribSocket = channels[channelId].available.shift();
                    channels[channelId].in_chat.push(contribSocket);
                    socket.emit('match', clientSocket.username);
                    clientSocket.emit('match', socket.username);
                    if (channels[channelId].available.length === 0){
                        io.emit('busy_channel', channelId);
                    }
                } else {
                    if (channels[channelId].available.length === 1){
                        io.emit('available_channel', channelId);
                    }
                }
                userLocation[socket.username] = channelId;
            }
        });

        // When a client request for a contributor to chat
        socket.on('request', channelId => {
            if (channelId) {
                userLocation[socket.username] = channelId;
                createChannel(channelId);
                let channel = channels[channelId];
                if (channel.available.length) {
                    let contrib_socket = channel.available.shift();
                    channel.in_chat.push(contrib_socket);
                    socket.emit('match', contrib_socket.username);
                    contrib_socket.emit('match', socket.username);
                    if (channel.available.length === 0){
                        io.emit('busy_channel', channelId);
                    }
                } else {
                    channel.queue.push(socket);
                }
                userLocation[socket.username] = channelId;
                console.log(channels)
            }
        });

        // When someone leaves a channel
        socket.on('leave', channelId => {
            if (channelId) {
                removeSocketFromChannel(channelId);
            }
        });

        socket.on('disconnect', () => {
            console.log('[%s] disconnected', socket.username);

            let channelId = userLocation[socket.username];
            removeSocketFromChannel(channelId);
      
            let connIndex = connections.indexOf(socket);
            if (connIndex > -1) {
                connections.splice(connIndex, 1);
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

const createChannel = channelId => {
    if (!channels[channelId]){
        channels[channelId] = {available: [], in_chat: [], queue: []};
    }
};

module.exports = initialize;
