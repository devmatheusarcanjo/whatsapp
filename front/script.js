const enderecoServer = '192.168.10.14';
const main = document.querySelector('#main');
const chat = document.querySelector('.chat-home');
const nomeHtml = document.getElementById('nome');
let nome = null;

function limpar() {
  delete localStorage.nome;
}

const sons = {
  mensagemEnviada: new Audio('./audios/mensagemenviadatexto.m4a'),
  mensagemRecebida: new Audio('./audios/mensagemrecebida.m4a'),
};

// Dados com nome para atualizar sempre que for alterado.
const dados = {
  _nome: localStorage.getItem('nome'),
  set nome(nome) {
    localStorage.setItem('nome', nome);
    this._nome = nome;
    document.getElementById('nome').textContent = nome;
  },
  get nome() {
    return this._nome;
  },
};

function perguntarEValidarNome(texto = 'Qual é seu nome?') {
  const nome = prompt(texto);
  console.log(typeof nome);

  let teste;

  try {
    teste = nome.trim();
  } catch {
    teste = nome;
  }

  if (nome === null || teste.split('').length < 1) {
    perguntarEValidarNome('Esse nome não é valido!');
  }

  return nome;
}

// Definir nome ao carregar a pagina
window.addEventListener('load', () => {
  const { nome: nomeStorage } = dados;

  if (!Boolean(nomeStorage) || nomeStorage === 'null') {
    const nomeInput = perguntarEValidarNome();

    localStorage.nome = nomeInput;
    dados.nome = nomeInput;
  } else {
    dados.nome = nomeStorage;
  }
});

// Função para adicionar atributos em elementos
Object.prototype.addAtributes = function (atributos) {
  if (!atributos) return this;

  const props = Object.entries(atributos);

  props.forEach((e) => {
    const [nome, valor] = e;
    this.setAttribute(nome, valor);
  });

  return this;
};

function createElement(tag) {
  return document.createElement(tag);
}

function criarMensagem(mensagem, atributos = null) {
  // Criando e adicionando atributos.

  const container = createElement('div').addAtributes(atributos);

  const p = createElement('p');

  //////// CONTAINER HORA

  const containerCheckEHora = criarContainerHora();

  //////// Adicionando nome na mensagem
  const nomeElement = createElement('span').addAtributes({
    ['class']: 'nome-usuario',
  });
  nomeElement.textContent = `~ ${dados.nome}`;

  // Se for passado um texto entao inserir no elemento.
  if (mensagem) p.textContent = mensagem;

  container.appendChild(p);
  // container.appendChild(horaElement);
  container.appendChild(nomeElement);
  container.appendChild(containerCheckEHora);

  return container;
}

// Criar conteiner hora - Utilizado na função (criarMensagem)
function criarContainerHora() {
  const containerHora = createElement('div').addAtributes({
    ['class']: 'container-hora',
  });

  const horaElement = createElement('span').addAtributes({ ['class']: 'hora' });

  // Obtendo hora atual e adicionando no conteudo da mensagem horario.
  const horario = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const check = createElement('span').addAtributes({
    ['class']: 'bi bi-clock check',
    attribute: 'check',
  });

  horaElement.textContent = horario;
  containerHora.appendChild(horaElement);
  containerHora.appendChild(check);

  return containerHora;
}

// Função para enviar mensagem e atualizar a interface
function enviarMensagem(event) {
  event.preventDefault();

  const form = event.target;
  const input = form.message;

  const mensagem = input.value;

  //// Se nao tiver algum caractere no input, então nao envie a mensagem
  const mensagemSemEspaco = mensagem.trim();
  if (!mensagemSemEspaco) {
    input.focus();
    return;
  }

  const idMessage = gerarIdParaMensagem();

  const messageElement = criarMensagem(mensagem, {
    ['class']: 'message',
    user: 'me',
    id: idMessage,
  });

  const messageForServer = messageElement.cloneNode(true);

  messageForServer.querySelector('.check').remove();

  const forServer = {
    elemento: messageForServer.outerHTML,
    user: localStorage.nome,
    idMessage,
  };

  // Enviar mensagem para o servidor
  setTimeout(() => {
    socket.emit('mensagemClient', JSON.stringify(forServer));
  }, 300);

  main.appendChild(messageElement);

  // Dar scroll para a nova mensagem enviada.
  messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  input.value = '';
  input.focus();
}

function gerarIdParaMensagem() {
  return Date.now() + dados.nome;
}

// FUNÇÃO PARA ENVIAR EVENTO DE DIGITAÇÃO

window.addEventListener('load', () => {
  const input = document.querySelector('#input-message');

  let ultimaReferencia = null;

  function digitando(event) {
    clearTimeout(ultimaReferencia);

    if (ultimaReferencia === null) {
      socket.emit('clienteDigitandoOn', dados.nome);
    }

    ultimaReferencia = setTimeout(() => {
      socket.emit('clienteDigitandoOff', dados.nome);
      ultimaReferencia = null;
    }, 3000);
  }

  input.addEventListener('input', digitando);
});

/// OUVINTES SOCKET.IO

/// Iniciando a comunicação
const socket = io(`${enderecoServer}:3000/grupo`);

/// Ouvir eventos da rota mendagemServidor
socket.on('mensagemServidor', (msg) => {
  const nomeLocal = localStorage.nome;

  const { elemento, user } = JSON.parse(msg);

  const div = document.createElement('div');
  div.innerHTML = elemento;
  div.querySelector('div').setAttribute('user', 'outer');

  if (!(nomeLocal === user)) {
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

/*
check2
check2-all
clock
*/
