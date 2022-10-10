const socket = io();
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const entranceForm = document.getElementById('entrance');
const input = document.getElementById('input');
const list = document.querySelector("#user-list");
const logElm = document.querySelector("#log");
let nickname = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector("#nickname").focus();
}, false);

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', { socket__id: socket.id, nickname: nickname, message: input.value, date: new Date() } );
    input.value = '';
  }
});

entranceForm.addEventListener('submit', function(e) {
  e.preventDefault();
  nickname = document.querySelector("#nickname").value.trim();
  if (nickname) {
    socket.emit('LogUser', nickname);
    input.focus();
  } else {
    alert("Nome inválido!");
  }
});

socket.on('RenderUsersList', function(users) {
  list.innerHTML = "";
  for (let i = 0; i < users.length; i++) {
    list.innerHTML += (socket.id === users[i].socket__id) ? `<li class="list-group-item"><strong>${ users[i].nickname } (You)</strong></li>` : `<li class="list-group-item">${ users[i].nickname }</li>`;
  }
  list.parentElement.scrollTop = list.parentElement.scrollHeight;
});

socket.on('RenderUserLog', function(users) {
  logElm.innerHTML = "";
  for (let i = 0; i < users.length; i++) {
    logElm.innerHTML += `<p class="m-0"><span style="font-size: .75em">${ new Date(users[i].time).toLocaleString().replace(", ", " at ") }</span> <strong>${ users[i].nickname }</strong> ${ (users[i].loggedIn) ? "joined" : "left" } the chatroom</p>`;
  }
  log.scrollTop = log.scrollHeight;
});

socket.on('UserConnected', function(user) {
  if (document.querySelector("#nickname__overlay") && socket.id === user.socket__id) {
    document.querySelector("#nickname__overlay").remove();
  }
});

socket.on('ShowError', function(msg) {
  alert(msg);
});

socket.on('RenderPreviousMessages', function(msgs) {
  messages.innerHTML = "";
  for (msg of msgs) {
    messages.innerHTML += `
    <div class="p-2 mb-2 w-auto ${(socket.id === msg.socket__id) ? 'sender' : 'receiver'}">
      <p style="font-size: .75em;"><strong>${ msg.nickname }</strong> at ${ new Date(msg.date).toLocaleString() }</p>
      <p class="m-0 p-0">${msg.message}</p>
    </div`;
  }
  messages.scrollTop = messages.scrollHeight;
});

socket.on('chat message', function(msg) {
  messages.innerHTML += `
  <div class="p-2 mb-2 w-auto ${(socket.id === msg.socket__id) ? 'sender' : 'receiver'}">
    <p style="font-size: .75em;"><strong>${ msg.nickname }</strong> at ${ new Date(msg.date).toLocaleString() }</p>
    <p class="m-0 p-0">${msg.message}</p>
  </div`;
  messages.scrollTop = messages.scrollHeight;
});