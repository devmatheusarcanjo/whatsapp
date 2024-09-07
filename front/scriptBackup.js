    const socket = io("http://192.168.10.19:3000");

socket.on("mensagemServidor", (msg) => {
    
    const nomeLocal = localStorage.nome    
    
    const {elemento, user} = JSON.parse(msg);
    
    const div = document.createElement("div");
    div.innerHTML = elemento;     
    div.querySelector("div").setAttribute("user", "outer")          
        
    
    if (!(nomeLocal === user)) {
        sons.mensagemRecebida.play();
        main.innerHTML += div.innerHTML;
        const ultimo = document.querySelectorAll("main *");
        
        const numero = ultimo.length - 1;
        
        ultimo[numero].scrollIntoView({behavior: "smooth"})
    }
    
    
})
               
    
    const main = document.querySelector("#main");
    const chat = document.querySelector(".chat-home");
    const nomeHtml = document.getElementById("nome");
    let nome = null;
            
   
function limpar() {
    delete localStorage.nome;
}

 
const sons = {
    mensagemEnviada: new Audio("./audios/mensagemenviadatexto.m4a"),
    mensagemRecebida: new Audio("./audios/mensagemrecebida.m4a"), 
}  

// Dados com nome para atualizar sempre que for alterado.
const dados = {
    _nome: localStorage.getItem("nome"),
    set nome(nome) {
       localStorage.setItem("nome", nome)
       this._nome = nome;                 document.getElementById("nome").textContent = nome;
    },
    get nome() {
        return this._nome;
    }
} 


function perguntarEValidarNome(texto = "Qual é seu nome?") {                      
     const nome = prompt(texto)
     console.log(typeof nome)
     
     let teste;
    
     try {
        teste = nome.trim()
     } catch {
        teste = nome;
     }     
                           
     
     if (nome === null || teste.split("").length < 1) {
               perguntarEValidarNome("Esse nome não é valido!")
     }          
      
       return nome
 }

// Definir nome ao carregar a pagina
window.addEventListener("load", () => {    
        
    const {nome: nomeStorage} = dados;        
    
    if (!Boolean(nomeStorage) || nomeStorage === "null") {
                  
       const nomeInput = perguntarEValidarNome();            
                         
        localStorage.nome = nomeInput;
        dados.nome = nomeInput;
                
        
    } else {
              
        dados.nome = nomeStorage;
    }
})  

 
// Função para adicionar atributos em elementos
Object.prototype.adicionarAtributos = function(atributos) {

    if (!atributos) return this;

    const props =   Object.entries(atributos);
            
    props.forEach(e => {
        const [nome, valor] = e;
        this.setAttribute(nome, valor)
        })
        
    return this;
}




// Função para criar elementos de mensagem.

function createElement(tag) {
    return document.createElement(tag)
}



function criarMensagem(mensagem, atributos = null) {
// Criando e adicionando atributos.    

    const container = createElement("div").adicionarAtributos(atributos);
    
    const p = createElement("p");
    
    const check = createElement("span").adicionarAtributos({
        ["class"]: "bi bi-clock check"        
    })  
    
                    
    const horaElement = createElement("span").adicionarAtributos({["class"]: "hora"});
    
    // Obtendo hora atual e adicionando no conteudo da mensagem.
    const hora = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
        
    horaElement.textContent = hora;
       
   
    
    const nomeElement = createElement("span").adicionarAtributos({["class"]: "nome-usuario"})
    nomeElement.textContent = `~ ${dados.nome}`;
    
       
        
                         
    // Se for passado um texto entao inserir no elemento.
    if (mensagem) p.textContent = mensagem;
    
    container.appendChild(p)
    container.appendChild(horaElement);
    container.appendChild(nomeElement);
    container.appendChild(check)
            
    return container;
}





// Função para enviar mensagem e atualizar a interface
function enviarMensagem(event) {
    event.preventDefault();
    
    
    const form = event.target;
    const input = form.message
    
    const mensagem = input.value;
   
    const messageElement = criarMensagem(mensagem, {
        ["class"]: "message",
        user: "me"
    });    
           
    
    const forServer = {
        elemento: messageElement.outerHTML,
        user: localStorage.nome
    }
    
    socket.emit("mensagemClient", JSON.stringify(forServer))
    
   sons.mensagemEnviada.play()
        
    
    main.appendChild(messageElement)
    
    // Dar scroll para a nova mensagem enviada.
    messageElement.scrollIntoView(
        {behavior: "smooth", block: "center"}
    )
    
    input.value = "";
    input.focus()    
    
}


/*
check2
check2-all
clock
*/
