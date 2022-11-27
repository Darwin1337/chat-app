const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let currentUsers = [], userLog = [], messages = []

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('LogUser', (nickname) => {
	console.log("Connected user");
    if (!currentUsers.some(user => user.nickname === nickname)) {
      currentUsers.push({ socket__id: socket.id, nickname: nickname });
      userLog.push({ nickname: nickname, time: new Date(), loggedIn: true });
      io.emit('UserConnected', currentUsers[currentUsers.length - 1]);
      io.emit('RenderUsersList', currentUsers);
      io.emit('RenderUserLog', userLog);
      io.emit('RenderPreviousMessages', messages);
    } else {
      socket.emit('ShowError', 'The chosen name has already been taken!');
    }
  });
  
  socket.on('LogoutUser', () => {
	console.log("Disconnected user");
    socket.disconnect(true);
  });

  socket.on('disconnect', () => {
    const user = currentUsers.find(user => user.socket__id === socket.id);
    if (user) {
      userLog.push({ nickname: user.nickname, time: new Date(), loggedIn: false });
      currentUsers = currentUsers.filter(user => user.socket__id !== socket.id);
      io.emit('RenderUsersList', currentUsers);
      io.emit('RenderUserLog', userLog);
    }
  });

  socket.on('chat message', (msg) => {
    messages.push(msg);
    io.emit('chat message', msg);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:' + (process.env.PORT) ? process.env.PORT : 3000);
});