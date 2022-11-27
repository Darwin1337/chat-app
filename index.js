const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

let currentUsers = [], userLog = [], messages = []

app.use(express.static(__dirname));
app.use(cors());

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
	handleLogout(socket);
  });

  socket.on('disconnect', () => {
	handleLogout(socket);
  });

  socket.on('chat message', (msg) => {
    messages.push(msg);
    io.emit('chat message', msg);
  });
});

const handleLogout = (socket) => {
    const user = currentUsers.find(user => user.socket__id === socket.id);
    if (user) {
      userLog.push({ nickname: user.nickname, time: new Date(), loggedIn: false });
      currentUsers = currentUsers.filter(user => user.socket__id !== socket.id);
	  console.log("removed user");
	  console.log(user);
      io.emit('RenderUsersList', currentUsers);
      io.emit('RenderUserLog', userLog);
    }
}

server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});