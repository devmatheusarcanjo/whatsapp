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
let usuariosOnline = [];

grupo.on('connection', (socket) => {
  usuariosOnline.push(socket.id);
  grupo.emit('usuariosOnline', usuariosOnline.length - 1);

  socket.on('mensagemClient', (msg) => {
    console.log('Mensagem do cliente:', msg);

    const { user, idMessage } = JSON.parse(msg);

    // Avisar mensagem recebida pelo server
    socket.emit('notificarMensagemRecebidaPeloServer', idMessage);

    grupo.emit('mensagemServidor', msg);
  });

  socket.on('clienteDigitandoOn', (nome) => {
    console.log(nome + ' esta digitando');

    grupo.emit('digitandoOn', nome);
  });

  socket.on('clienteDigitandoOff', (nome) => {
    console.log(nome + ' parou de digitar');

    grupo.emit('digitandoOff', nome);
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
