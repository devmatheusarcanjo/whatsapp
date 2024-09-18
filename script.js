const enderecoServer = 'https://bdbc-45-229-55-82.ngrok-free.app';
const main = document.querySelector('#main');
const chat = document.querySelector('.chat-home');
const nomeHtml = document.getElementById('nome');
let nome = null;

function limpar() {
  delete localStorage.nome;
}

function fecharSeClicarFora(event) {
  const { target } = event;
  const { parentNode } = target;
  console.log(event);

  const validacao = target.matches('.menu') || target.matches('.opcoes');
  const validacao2 = parentNode.matches('.menu');

  if (!(validacao || validacao2)) {
    console.log(event);
    abrirOuFecharMenu(false);
  }
}

function abrirOuFecharMenu(seAbrir) {
  const menu = document.getElementById('menu');
  if (seAbrir) {
    window.addEventListener('click', fecharSeClicarFora);
    menu.classList.remove('fechado');
    menu.classList.add('aberto');
  } else {
    window.removeEventListener('click', fecharSeClicarFora);
    menu.classList.remove('aberto');
    menu.classList.add('fechado');
  }
}

function alternarMenu(event) {
  const menu = document.getElementById('menu');
  const estaAberto = menu.classList.contains('fechado');
  abrirOuFecharMenu(estaAberto);
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

  const mensagemId = gerarIdParaMensagem();

  const messageElement = criarMensagem(mensagem, {
    ['class']: 'message',
    user: 'me',
    id: mensagemId,
  });

  const messageForServer = messageElement.cloneNode(true);

  messageForServer.querySelector('.check').remove();

  const forServer = {
    elemento: messageForServer.outerHTML,
    nomeUsuario: localStorage.nome,
    mensagemId,
  };

  // Enviar mensagem para o servidor
  enviarMensagemParaTodos(forServer);

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

/*
check2
check2-all
clock
*/
