const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const cors = require('cors');

// Configurar CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Permitir todas as origens
    methods: ['GET', 'POST'],
  },
});

const grupo = io.of('/grupo');
const mensagens = {
  id: ['jahdkd'],
  quemRecebeu: ['fulano'],
};
let usuariosOnline = [];

grupo.on('connection', (socket) => {
  usuariosOnline.push(socket.id);
  grupo.emit('usuariosOnline', usuariosOnline.length - 1);

  socket.on('mensagemClient', (msg) => {
    console.log('Mensagem do cliente:', msg);

    const { nomeUsuario, mensagemId } = JSON.parse(msg);

    // Avisar mensagem recebida pelo server
    socket.emit('notificarMensagemRecebidaPeloServer', mensagemId);
    socket.broadcast.emit('novaMensagem', msg);
  });

  socket.on('clienteDigitandoOn', (nome) => {
    console.log(nome + ' esta digitando');

    socket.broadcast.emit('digitandoOn', nome);
  });

  socket.on('clienteDigitandoOff', (nome) => {
    console.log(nome + ' parou de digitar');

    socket.broadcast.emit('digitandoOff', nome);
  });

  socket.on('disconnect', (event) => {
    console.log('Cliente desconectado');
    const index = usuariosOnline.indexOf(socket.id);
    usuariosOnline = usuariosOnline.filter((e, i) => i !== index);
    socket.broadcast.emit('usuariosOnline', usuariosOnline.length - 1);
  });
});

server.listen(3000, () => {
  console.log('Servidor Socket.IO escutando na porta 3000');
});
