const connection = (socket) => {
  clientes.add(socket.id);

  socket.on('mensagemClient', (msg) => {
    console.log('Mensagem do cliente:', msg);

    const lerMsg = JSON.parse(msg);

    const { user, idMessage } = lerMsg;

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
    console.log(socket.id);
  });
};

module.exports = connection;
