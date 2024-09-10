
/// Função que emite o envio da nova mensahem para o servidor distribuir para todos os usuarios.
function enviarMensagemParaTodos(dados) {    
    const dadosJson = JSON.stringify(dados);    
    socket.emit('mensagemClient', dadosJson); 
}