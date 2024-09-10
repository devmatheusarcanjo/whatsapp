/// OUVINTES SOCKET.IO

/// Iniciando a comunicação
const socket = io(`${enderecoServer}/grupo`);

/// Ouvir eventos da rota mendagemServidor
socket.on('novaMensagem', (msg) => {
  const nomeLocal = localStorage.nome;

  const { elemento, nomeUsuario } = JSON.parse(msg);

  const div = document.createElement('div');
  div.innerHTML = elemento;
  div.querySelector('div').setAttribute('user', 'outer');

  if (!(nomeLocal === nomeUsuario)) {
    sons.mensagemRecebida.pause();
    sons.mensagemRecebida.play();
    main.innerHTML += div.innerHTML;
    const ultimo = document.querySelectorAll('main *');

    const numero = ultimo.length - 1;

    ultimo[numero].scrollIntoView({ behavior: 'smooth' });
  }
});

///// Ouvir eventos da rota que avisa se a mensagem foi enviada.
socket.on('notificarMensagemRecebidaPeloServer', (id) => {
  sons.mensagemEnviada.pause();
  sons.mensagemEnviada.play();

  const element = document.getElementById(id);

  const check = element.querySelector('.check');
  check.classList = 'bi bi-check2 check';
});

// Funções receber eventos de digitação on e off

const controllInfoEvents = {
  online: [],
  digitando: [],

  set digitandoOn(user) {
    this.digitando.push(user);

    this.atualizarInfos();
  },

  set digitandoOff(user) {
    let digitando = this.digitando;
    const index = digitando.indexOf(user);
    digitando[index] = null;
    this.digitando = digitando.filter((e) => e !== null);

    this.atualizarInfos();
  },

  set UsuariosOnline(quantidade) {
    this.online = quantidade;
    this.atualizarInfos();
  },

  atualizarInfos() {
    const tag = document.getElementById('info-events');
    const online = this.online;
    const digitando = this.digitando;
    let mensagem;

    if (digitando.length > 0) {
      mensagem = digitando.reduce((acu, user, index, array) => {
        const size = array.length;

        if (index === 0 && size === 1) return user + ' está digitando...';
        if (index === 1 && size === 2)
          return acu + ` e ${user} estão digitando...`;
        if (index === size - 1) return acu + ` e ${user} estão digitando...`;
        if (index === 0 && size > 1) return user;
        if (size > 1) return acu + `, ${user}`;

        // return acu + `, ${user}`
      }, '');

      //mensagem += " está digitando!"
    } else {
      mensagem = `${online} pessoas online.`;
    }

    tag.textContent = mensagem;
  },
};

socket.on('usuariosOnline', (numero) => {
  controllInfoEvents.UsuariosOnline = numero;

  console.log(numero + ' online');
});

socket.on('digitandoOn', (user) => {
  controllInfoEvents.digitandoOn = user;

  const { online, digitando } = controllInfoEvents;

  console.log(user + ' começou a digitar');
});

socket.on('digitandoOff', (user) => {
  controllInfoEvents.digitandoOff = user;
  const { online, digitando } = controllInfoEvents;

  console.log(user + ' parou de digitar');
});
