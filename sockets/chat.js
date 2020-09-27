const socketIo = require('socket.io');
const Message = require('../models/message');
const config = require('../config');

const users = [];
const channels = {};
const userLocation = {};
const connections = [];
const chatWith = {};

const initialize = server => {
  const io = socketIo(server, { path: config.chatPath });

  io.on('connection', socket => {

    // Some setups
    const removeSocketFromList = (list) => {
      for(var i = 0; i < list.length; i++) {
          if (list[i] === socket.username) {
              list.splice(i, 1);
              return true;
          }
      }
      return false;
    };

    const removeSocketFromChannel = (channelId) => {
      let channel = channels[channelId];
      if (removeSocketFromList(channel.available, socket.username)){
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
          removeSocketFromList(channel.queue, socket.username)
      }
      userLocation[socket.username] = null;
    };

    connections.push(socket);
    socket.join('chat-room');

    const sendHeartbeat = () => {
      setTimeout(sendHeartbeat, 8000);
      io.sockets.emit('ping', { beat : 1 });
    }
    
    setTimeout(sendHeartbeat, 8000)

    socket.on('username', data => {
      if (data.username) {
        socket.username = data.username;
        let user = { username: socket.username, id: socket.id };
        let existing = searchUser(user.username);
        if (existing == false) {
          users.push(user);
        } else {
          socket.emit("duplicated")
        }

        io.emit('active', users);
        console.log('[%s] connected', socket.username);
        console.log('<users>:', users);
        console.log("Channels state:", channels)
      }
    });

    socket.on('get_channels', () => {
      socket.emit('channels', channels);
    });

    socket.on('getactive', () => {
      socket.emit('active', users);
    });

    socket.on('message', data => {
      if (data.to == 'chat-room') {
        socket.broadcast.to('chat-room').emit('message', data.message);
      } else {
        let user = searchUser(data.to);
        if (user != false) {
          let instances = searchConnections(data.to);
          if (instances.length > 0) {
            for (let instance of instances) {
              socket.broadcast.to(instance.id).emit('message', data.message);
            }
            let myOtherInstances = searchConnections(socket.username);
            if (myOtherInstances.length > 1) {
              for (let conn of myOtherInstances) {
                // exclude me
                if (conn != socket) {
                  socket.broadcast.to(conn.id).emit('message', data.message);
                }
              }
            }
          }
        }
      }
      console.log(
        '[%s].to(%s)<< %s',
        data.message.from,
        data.to,
        data.message.text
      );

      // save the message to the database
      let message = new Message(data.message);
      Message.addMessage(message, (err, newMsg) => {});
    });

    socket.on('leave chat', username => {
      let instances = searchConnections(username);
      if (instances.length > 0) {
        for (let instance of instances) {
          socket.broadcast.to(instance.id).emit('remind');
        }
      }
    });

    // When a contributor starts taking in clients
    socket.on('accept', channelId => {
      if (channelId && userLocation[socket.username] !== channelId) {
          userLocation[socket.username] = channelId;
          createChannel(channelId);
          let queue = channels[channelId].queue;
          channels[channelId].available.push(socket.username);
          if (queue.length) {
              let clientSocket = queue.shift();
              let contribSocket = channels[channelId].available.shift();
              channels[channelId].in_chat.push(contribSocket);
              match(contribSocket, clientSocket);
              if (channels[channelId].available.length === 0){
                  io.emit('busy_channel', channelId);
              }
          } else {
              if (channels[channelId].available.length === 1){
                  io.emit('available_channel', channelId);
              }
          }
          userLocation[socket.username] = channelId;
          console.log("Channels state:", channels)
      }
    });

    // When a contributor accepts the next client
    socket.on('next', channelId => {
      if (channelId && channels[channelId] && channels[channelId].in_chat.indexOf(socket.username) >= 0) {
          let queue = channels[channelId].queue;
          if (queue.length) {
              let clientSocket = queue.shift();
              match(socket.username, clientSocket, channelId);
          } else {
              let in_chat_users = channels[channelId].in_chat;
              let socketIndex = in_chat_users.indexOf(socket.username);
              in_chat_users.splice(socketIndex, 1);
              channels[channelId].available.push(socket.username);
              if (channels[channelId].available.length === 1){
                  io.emit('available_channel', channelId);
              }
          }
          console.log("Channels state:", channels)
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
              match(contrib_socket, socket.username);
              if (channel.available.length === 0){
                  io.emit('busy_channel', channelId);
              }
          } else {
              channel.queue.push(socket.username);
          }
          userLocation[socket.username] = channelId;
          console.log(channels)
      }
    });

    // When someone leaves a channel
    socket.on('leave channel', channelId => {
      if (channelId) {
          removeSocketFromChannel(channelId);
      }
      console.log("Channels state:", channels)
    });

    socket.on('disconnect', (reason) => {
      console.log("disconnect reasons: ", reason)
      let chatWithUsername = chatWith[socket.username];
      if (chatWithUsername && chatWith[chatWithUsername]){
        chatWith[chatWithUsername] = null;
        chatWith[socket.username] = null;
        let chatWithSocket = searchConnections(chatWithUsername)[0];
        socket.broadcast.to(chatWithSocket.id).emit('remind');
      }

      let instances = searchConnections(socket.username);
      if (instances.length == 1) {
        let user = searchUser(socket.username);
        if (user != false) {
          users.splice(users.indexOf(user), 1);
        }
      }

      let channelId = userLocation[socket.username];
      if (channelId) {
        removeSocketFromChannel(channelId);
      }

      io.emit('active', users);
      console.log('[%s] disconnected', socket.username);
      console.log('<users>:', users);

      let connIndex = connections.indexOf(socket);
      if (connIndex > -1) {
        connections.splice(connIndex, 1);
      }
      console.log("Channels state:", channels)
    });
  });
};

const searchUser = username => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].username == username) {
      return users[i];
    }
  }

  return false;
};

const searchConnections = username => {
  let found = [];
  for (let conn of connections) {
    if (conn.username == username) {
      found.push(conn);
    }
  }

  if (found.length > 0) {
    return found;
  } else {
    return false;
  }
};

const createChannel = channelId => {
  if (!channels[channelId]){
      channels[channelId] = {available: [], in_chat: [], queue: []};
  }
};

const match = (contributor, client) => {
  let contribSocket = searchConnections(contributor)[0];
  let clientSocket = searchConnections(client)[0];
  contribSocket.emit('match', {chatWith: client, isContributor: true});
  clientSocket.emit('match', {chatWith: contributor, isContributor: false});
  chatWith[client] = contributor;
  chatWith[contributor] = client;
};

module.exports = initialize;
